"use client";

import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async () => {
    if (!email) return;

    if (!API_URL) {
      alert("Backend not connected.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Request failed");

      alert("Application received. We’ll contact you shortly.");
      setEmail("");
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        {/* HERO */}
        <h1 style={styles.h1}>RoofFlow</h1>

        <p style={styles.subtext}>
          We deliver high-intent roofing leads directly to contractors.
          No cold calls. No shared leads. Just booked jobs.
        </p>

        {/* CTA */}
        <div style={styles.ctaBox}>
          <input
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={handleSubmit} style={styles.button}>
            {loading ? "Sending..." : "Get Exclusive Access"}
          </button>
        </div>

        <p style={styles.micro}>⚡ Limited spots per city</p>

        {/* TRUST */}
        <div style={styles.section}>
          <h2>How it works</h2>
          <p style={styles.text}>
            1. Homeowners request roofing quotes  
            2. We qualify and score each lead using AI  
            3. Only high-intent jobs get sent to you  
          </p>
        </div>

        {/* VALUE */}
        <div style={styles.section}>
          <h2>Why contractors switch</h2>
          <p style={styles.text}>
            • No competing contractors  
            • No wasted ad spend  
            • Higher close rates  
          </p>
        </div>

        {/* SOCIAL PROOF (placeholder for now) */}
        <div style={styles.section}>
          <h2>Early Results</h2>
          <p style={styles.text}>
            Contractors are already closing jobs within days of joining.
          </p>
        </div>
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    background: "#0b1220",
    color: "white",
    fontFamily: "system-ui",
    padding: "40px 20px",
  },

  container: {
    maxWidth: "700px",
    margin: "0 auto",
    textAlign: "center",
  },

  h1: {
    fontSize: "52px",
    marginBottom: "10px",
  },

  subtext: {
    fontSize: "18px",
    opacity: 0.8,
    marginBottom: "30px",
  },

  ctaBox: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "10px",
  },

  input: {
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    width: "260px",
  },

  button: {
    padding: "14px 18px",
    background: "#4da3ff",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },

  micro: {
    fontSize: "12px",
    opacity: 0.6,
    marginBottom: "40px",
  },

  section: {
    marginTop: "40px",
  },

  text: {
    opacity: 0.8,
    lineHeight: "1.6",
  },
};