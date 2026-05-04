"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeads() {
    try {
      const res = await fetch(`${API_URL}/api/leads`);
      const data = await res.json();

      setLeads(data.leads || []);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  const totalRevenue = leads.reduce((sum, l) => sum + (l.price || 0), 0);

  return (
    <main style={styles.page}>
      <h1 style={styles.h1}>Admin Control Panel</h1>

      {/* STATS BAR */}
      <div style={styles.stats}>
        <div style={styles.card}>
          <p>Total Leads</p>
          <h2>{leads.length}</h2>
        </div>

        <div style={styles.card}>
          <p>Total Revenue</p>
          <h2>${(totalRevenue / 100).toFixed(2)}</h2>
        </div>
      </div>

      {/* LEADS TABLE */}
      <div style={styles.table}>
        <h3>Live Leads</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} style={styles.row}>
              <div>
                <b>{lead.city}</b>
                <p style={{ fontSize: 12, opacity: 0.7 }}>
                  {lead.status}
                </p>
              </div>

              <div>${(lead.price || 0) / 100}</div>

              <div>
                {lead.assigned_contractor_id || "Unassigned"}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

// =====================
// STYLES
// =====================
const styles = {
  page: {
    padding: 40,
    background: "#0b1220",
    color: "white",
    minHeight: "100vh",
    fontFamily: "system-ui",
  },

  h1: {
    fontSize: 32,
    marginBottom: 20,
  },

  stats: {
    display: "flex",
    gap: 20,
    marginBottom: 30,
  },

  card: {
    background: "#111827",
    padding: 20,
    borderRadius: 12,
    flex: 1,
  },

  table: {
    background: "#111827",
    padding: 20,
    borderRadius: 12,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #1f2937",
  },
};