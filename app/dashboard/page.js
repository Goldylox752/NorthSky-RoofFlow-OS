"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [connected, setConnected] = useState(false);

  const channelRef = useRef(null);

  // ===============================
  // UPSERT ENGINE (SAFE MERGE)
  // ===============================
  const upsertLead = (incoming) => {
    setLeads((prev) => {
      const idx = prev.findIndex((l) => l.id === incoming.id);

      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...incoming };
        return copy;
      }

      return [incoming, ...prev].slice(0, 150);
    });
  };

  // ===============================
  // SNAPSHOT LOAD (INITIAL STATE)
  // ===============================
  const loadSnapshot = async () => {
    try {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) setLeads(data);
    } catch (e) {
      console.error("Snapshot failed:", e);
    }
  };

  // ===============================
  // REAL-TIME ENGINE (SUPABASE)
  // ===============================
  useEffect(() => {
    loadSnapshot();

    const channel = supabase
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        (payload) => {
          const row = payload.new;
          if (!row) return;

          upsertLead(row);
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ===============================
  // UI
  // ===============================
  return (
    <main style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Live Lead Feed</h1>
            <p style={styles.sub}>Real-time SaaS marketplace engine</p>
          </div>

          <div
            style={{
              ...styles.status,
              color: connected ? "#22c55e" : "#ef4444",
            }}
          >
            ● {connected ? "LIVE" : "CONNECTING"}
          </div>
        </header>

        {leads.length === 0 && (
          <div style={styles.empty}>Waiting for leads...</div>
        )}

        <div style={styles.grid}>
          {leads.map((l) => (
            <div key={l.id} style={styles.card}>
              <div style={styles.row}>
                <span>📍 {l.city || "Unknown"}</span>
                <span style={badge(l.status)}>{l.status}</span>
              </div>

              <p style={styles.text}>⚡ Score: {l.score}</p>

              <p style={styles.text}>
                🧠 Contractor: {l.assigned_contractor_id || "pending"}
              </p>

              <p style={styles.textSmall}>
                💰 ${(l.price || 0) / 100}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}