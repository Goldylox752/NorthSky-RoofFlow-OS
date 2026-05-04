"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [cities, setCities] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL;

  // ===============================
  // LOAD DATA
  // ===============================
  useEffect(() => {
    async function load() {
      try {
        const [cityRes, leadRes] = await Promise.all([
          fetch(`${API}/api/admin/cities`),
          fetch(`${API}/api/admin/leads`),
        ]);

        const citiesData = await cityRes.json();
        const leadsData = await leadRes.json();

        setCities(citiesData?.cities || []);
        setLeads(leadsData?.leads || []);
      } catch (err) {
        console.error("Admin load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading Admin Panel...</div>;
  }

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>🏙 RoofFlow Admin Dashboard</h1>

      {/* =======================
          CITY MARKETPLACE
      ======================= */}
      <section style={styles.section}>
        <h2>City Marketplace</h2>

        <div style={styles.grid}>
          {cities.map((c) => (
            <div key={c.city} style={card}>
              <h3>{c.city.toUpperCase()}</h3>

              <p>Tier: {c.tier}</p>
              <p>
                Contractors: {c.active_contractors?.length || 0} /{" "}
                {c.max_contractors}
              </p>

              <p>Status: {c.status || "active"}</p>

              <button style={button}>
                Manage City
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* =======================
          LIVE LEADS
      ======================= */}
      <section style={styles.section}>
        <h2>Live Leads</h2>

        <div style={styles.grid}>
          {leads.map((l) => (
            <div key={l.id} style={card}>
              <p>📍 {l.city}</p>
              <p>⚡ Status: {l.status}</p>
              <p>💰 Score: {l.score}</p>
              <p>🧠 Assigned: {l.assigned_contractor_id || "none"}</p>
              <p>💵 Price: ${(l.price || 0) / 100}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

// ===============================
// STYLES
// ===============================
const styles = {
  page: {
    background: "#0b1220",
    minHeight: "100vh",
    color: "white",
    padding: 30,
  },

  title: {
    fontSize: 28,
    marginBottom: 20,
  },

  section: {
    marginTop: 30,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: 12,
  },

  loading: {
    padding: 40,
    color: "white",
    background: "#0b1220",
  },
};

const card = {
  background: "#111827",
  padding: 14,
  borderRadius: 10,
  border: "1px solid #1f2937",
};

const button = {
  marginTop: 10,
  padding: "8px 12px",
  background: "#3b82f6",
  border: "none",
  borderRadius: 6,
  color: "white",
  cursor: "pointer",
};