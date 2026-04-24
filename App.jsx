import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import LeadQueue from "./components/LeadQueue";
import StatsBar from "./components/StatsBar";

export default function App() {

  const [leads, setLeads] = useState([]);
  const [agent, setAgent] = useState(null);

  // =========================
  // LOAD INITIAL DATA
  // =========================
  useEffect(() => {
    fetchLeads();
    subscribeToUpdates();
  }, []);

  async function fetchLeads() {

    const { data } = await supabase
      .from("assignments")
      .select(`
        id,
        status,
        lead:leads (*),
        agent_id
      `)
      .eq("status", "assigned")
      .order("assigned_at", { ascending: false });

    setLeads(data || []);
  }

  // =========================
  // REALTIME SUBSCRIPTION
  // =========================
  function subscribeToUpdates() {
    supabase
      .channel("queue_updates")
      .on("broadcast", { event: "lead_assigned" }, (payload) => {
        const newLead = payload.payload;

        setLeads((prev) => [newLead, ...prev]);
      })
      .subscribe();
  }

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>📞 Agent Dashboard</h1>

      <StatsBar leads={leads} />

      <LeadQueue leads={leads} setLeads={setLeads} />

    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    fontFamily: "Inter, sans-serif",
    background: "#0b1220",
    minHeight: "100vh",
    color: "white"
  },
  title: {
    fontSize: 28,
    marginBottom: 20
  }
};