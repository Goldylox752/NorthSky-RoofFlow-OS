"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const channelRef = useRef(null);

  // ===============================
  // SAFE UPSERT ENGINE (NO DUPES, NO RACES)
  // ===============================
  const upsertLead = (incoming) => {
    if (!incoming?.id) return;

    setLeads((prev) => {
      const idx = prev.findIndex((l) => l.id === incoming.id);

      const updatedLead = {
        ...(idx !== -1 ? prev[idx] : {}),
        ...incoming,
        _updatedAt: Date.now(),
      };

      let next;

      if (idx !== -1) {
        next = [...prev];
        next[idx] = updatedLead;
      } else {
        next = [updatedLead, ...prev];
      }

      // keep memory stable (important for SaaS scale)
      return next.slice(0, 200);
    });

    setLastUpdate(new Date().toISOString());
  };

  // ===============================
  // SNAPSHOT SYNC (INITIAL STATE)
  // ===============================
  const loadSnapshot = async () => {
    try {
      setLoading(true);

      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      setLeads(data || []);
    } catch (e) {
      console.error("Snapshot failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // REALTIME ENGINE (SUPABASE CORE)
  // ===============================
  useEffect(() => {
    loadSnapshot();

    const channel = supabase
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
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
  // UI STATUS COLOR
  // ===============================
  const statusColor = connected ? "#22c55e" : "#ef4444";

  return (
    <main style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Live Lead Feed</h1>

            <p style={styles.sub}>
              Real-time marketplace operations dashboard
            </p>

            <p style={styles.meta}>
              {loading
                ? "Syncing data..."
                : `Last update: ${lastUpdate || "—"}`}
            </p>
          </div>

          <div style={{ ...styles.status, color: statusColor }}>
            ● {connected ? "LIVE" : "CONNECTING"}
          </div>
        </header>

        {/* EMPTY STATE */}
        {!loading && leads.length === 0 && (
          <div style={styles.empty}>
            Waiting for incoming leads...
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div style={styles.empty}>Loading live marketplace...</div>
        )}

        {/* GRID */}
        <div style={styles.grid}>
          {leads.map((l) => (
            <div key={l.id} style={styles.card}>
              <div style={styles.row}>
                <span>📍 {l.city || "Unknown"}</span>
                <span style={badge(l.status)}>{l.status}</span>
              </div>

              <p style={styles.text}>⚡ Score: {l.score ?? 0}</p>

              <p style={styles.text}>
                🧠 Contractor:{" "}
                {l.assigned_contractor_id || "pending"}
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