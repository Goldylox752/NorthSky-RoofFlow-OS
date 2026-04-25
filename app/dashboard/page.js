import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetchLeads();

    const channel = supabase
      .channel("leads")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, fetchLeads)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchLeads() {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    setLeads(data || []);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Call Centre OS</h1>

      {leads.map(l => (
        <div key={l.id} style={{ padding: 10, border: "1px solid #333", marginBottom: 10 }}>
          <h3>{l.name}</h3>
          <p>{l.city}</p>
          <p>Status: {l.status}</p>
        </div>
      ))}
    </div>
  );
}
