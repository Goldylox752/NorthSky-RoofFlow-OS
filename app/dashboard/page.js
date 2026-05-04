"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [connected, setConnected] = useState(false);

  const eventRef = useRef(null);
  const lastEventIdRef = useRef(null);
  const reconnectTimer = useRef(null);

  // ===============================
  // SAFE MERGE ENGINE (ANTI-DUP + ORDER FIX)
  // ===============================
  const mergeLead = (incoming) => {
    setLeads((prev) => {
      const index = prev.findIndex((l) => l.id === incoming.id);

      if (index >= 0) {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          ...incoming,
        };
        return copy;
      }

      return [incoming, ...prev].slice(0, 100);
    });
  };

  // ===============================
  // REAL-TIME STREAM (PRODUCTION GRADE SSE)
  // ===============================
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL;

    if (!url) return;

    const connect = () => {
      const es = new EventSource(
        `${url}/api/leads/stream?lastEventId=${lastEventIdRef.current || ""}`
      );

      eventRef.current = es;

      // ===============================
      // OPEN
      // ===============================
      es.onopen = () => {
        setConnected(true);
      };

      // ===============================
      // MESSAGE HANDLER
      // ===============================
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // ===============================
          // EVENT DEDUP (CRITICAL FIX)
          // ===============================
          if (data.eventId && data.eventId === lastEventIdRef.current) {
            return;
          }

          lastEventIdRef.current = data.eventId;

          // ===============================
          // APPLY UPDATE
          // ===============================
          mergeLead(data);
        } catch (err) {
          console.error("Parse error:", err);
        }
      };

      // ===============================
      // ERROR + AUTO RECONNECT
      // ===============================
      es.onerror = () => {
        setConnected(false);
        es.close();

        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

        reconnectTimer.current = setTimeout(connect, 2500);
      };
    };

    connect();

    return () => {
      if (eventRef.current) eventRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, []);

  // ===============================
  // UI STATE
  // ===============================
  const statusColor = connected ? "#22c55e" : "#ef4444";

  return (
    <main style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Live Lead Feed</h1>
            <p style={styles.sub}>
              Real-time marketplace activity stream
            </p>
          </div>

          <div style={{ ...styles.status, color: statusColor }}>
            ● {connected ? "LIVE" : "RECONNECTING"}
          </div>
        </div>

        {/* EMPTY STATE */}
        {leads.length === 0 && (
          <div style={styles.empty}>
            Waiting for incoming leads...
          </div>
        )}

        {/* LEADS GRID */}
        <div style={styles.grid}>
          {leads.map((l) => (
            <div key={l.id} style={styles.card}>
              <div style={styles.row}>
                <span>📍 {l.city || "Unknown"}</span>
                <span style={badge(l.status)}>{l.status}</span>
              </div>

              <p style={styles.text}>⚡ Score: {l.score ?? "N/A"}</p>

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