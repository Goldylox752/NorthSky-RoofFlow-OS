"use client";

import { useState } from "react";

export default function PricingButton() {
  const [plan, setPlan] = useState("starter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }), // must match backend: starter | elite
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Checkout failed");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError("No checkout URL returned");
    } catch (err) {
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Choose Your Plan</h2>

      <select
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        style={styles.select}
        disabled={loading}
      >
        <option value="starter">Starter — $499/mo</option>
        <option value="elite">Elite — $999/mo</option>
      </select>

      <button
        onClick={handleCheckout}
        style={{
          ...styles.button,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
        disabled={loading}
      >
        {loading ? "Redirecting..." : "Continue to Checkout"}
      </button>

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 300,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },

  select: {
    padding: 10,
    borderRadius: 6,
    background: "#0b1220",
    color: "white",
    border: "1px solid #333",
  },

  button: {
    padding: 12,
    borderRadius: 8,
    background: "#3b82f6",
    color: "white",
    border: "none",
    fontWeight: "bold",
  },

  error: {
    color: "#ff6b6b",
    fontSize: 12,
  },
};
