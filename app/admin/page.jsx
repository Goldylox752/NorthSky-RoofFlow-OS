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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <main style={styles.page}>
      <h1 style={styles.h1}>RoofFlow Admin</h1>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Total Leads</h3>
          <p>{leads.length}</p>
        </div>

        <div style={styles.card}>
          <h3>Revenue Stream</h3>
          <p>$ live tracking coming</p>
        </div>

        <div style={styles.card}>
          <h3>Active Cities</h3>
          <p>Marketplace running</p>
        </div>
      </div>

      <h2 style={{ marginTop: 30 }}>Recent Leads</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={styles.table}>
          {leads.map((l) => (
            <div key={l.id} style={styles.row}>
              <div>{l.city}</div>
              <div>{l.score}</div>
              <div>{l.status}</div>
              <div>${l.price || 0}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const styles = {
  page: {
    padding: 40,
    background: "#0b1220",
    color: "white",
    minHeight: "100vh",
  },
  h1: { fontSize: 32, marginBottom: 20 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 20,
  },

  card: {
    background: "#111827",
    padding: 20,
    borderRadius: 10,
    border: "1px solid #1f2937",
  },

  table: {
    marginTop: 20,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    padding: 10,
    borderBottom: "1px solid #1f2937",
  },
};