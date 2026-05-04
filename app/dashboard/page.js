"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ContractorDashboard() {
  const [leads, setLeads] = useState([]);

  async function fetchLeads() {
    try {
      const res = await fetch(`${API_URL}/api/leads?status=assigned`);
      const data = await res.json();

      setLeads(data.leads || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  const revenue = leads.reduce((sum, l) => sum + (l.price || 0), 0);

  return (
    <main style={styles.page}>
      <h1 style={styles.h1}>Contractor Dashboard</h1>

      {/* KPI */}
      <div style={styles.kpi}>
        <div style={styles.card}>
          <p>Assigned Leads</p>
          <h2>{leads.length}</h2>
        </div>

        <div style={styles.card}>
          <p>Revenue Pipeline</p>
          <h2>${(revenue / 100).toFixed(2)}</h2>
        </div>
      </div>

      {/* LEADS */}
      <div style={styles.list}>
        <h3>Your Leads</h3>

        {leads.map((lead) => (
          <div key={lead.id} style={styles.item}>
            <div>
              <b>{lead.city}</b>
              <p style={{ fontSize: 12, opacity: 0.7 }}>
                Score: {lead.score || 0}
              </p>
            </div>

            <div>${(lead.price || 0) / 100}</div>

            <button style={styles.button}>Contact</button>
          </div>
        ))}
      </div>
    </main>
  );
}

// =====================
const styles = {
  page: {
    padding: 40,
    background: "#0b1220",
    color: "white",
    minHeight: "100vh",
  },

  h1: {
    fontSize: 30,
    marginBottom: 20,
  },

  kpi: {
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

  list: {
    background: "#111827",
    padding: 20,
    borderRadius: 12,
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #1f2937",
  },

  button: {
    background: "#4da3ff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    color: "white",
    cursor: "pointer",
  },
};