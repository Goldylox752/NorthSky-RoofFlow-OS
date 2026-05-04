"use client";

import { useEffect, useState } from "react";

export default function Admin() {
  const [cities, setCities] = useState([]);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    fetch("/api/cities")
      .then((r) => r.json())
      .then((d) => setCities(d.cities || []));
  }, []);

  return (
    <div>
      <h1>🧠 Admin Control Center</h1>

      <h2>💰 Revenue: ${revenue}</h2>

      <div style={styles.grid}>
        {cities.map((c) => (
          <div key={c.city} style={styles.card}>
            <h3>{c.city}</h3>
            <p>{c.tier}</p>

            <button style={styles.button}>Edit City</button>
            <button style={styles.button2}>Lock / Unlock</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 12,
    marginTop: 20,
  },
  card: {
    background: "#111827",
    padding: 15,
    borderRadius: 10,
  },
  button: {
    width: "100%",
    marginTop: 10,
    padding: 8,
    background: "#3b82f6",
    border: "none",
    color: "white",
  },
  button2: {
    width: "100%",
    marginTop: 6,
    padding: 8,
    background: "#ef4444",
    border: "none",
    color: "white",
  },
};