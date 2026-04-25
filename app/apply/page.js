"use client";

import { useState } from "react";

export default function Apply() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("growth");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const isValidPhone = (phone) =>
    /^[0-9]{10,15}$/.test(phone.replace(/\D/g, ""));

  const scoreLead = () => {
    let score = 0;
    if (isValidEmail(email)) score += 50;
    if (isValidPhone(phone)) score += 50;
    return score;
  };

  const handleNext = () => {
    setError("");

    if (!isValidEmail(email)) {
      return setError("Please enter a valid email.");
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const leadScore = scoreLead();

    // ⚠️ FRONTEND GATE (UX ONLY — backend must also validate)
    if (!isValidPhone(phone)) {
      return setError("Please enter a valid phone number.");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          phone,
          plan,
          leadScore, // 🔥 IMPORTANT FOR SERVER VALIDATION
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Checkout failed");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Apply to RoofFlow</h1>

        <p style={styles.step}>Step {step} of 2</p>

        <p style={styles.badges}>
          🔒 No spam · ⚡ Instant approval · 🏠 Exclusive leads only
        </p>

        {/* PLAN SELECTOR */}
        <div style={styles.planBox}>
          <p style={{ fontSize: 12, marginBottom: 6 }}>Choose Plan</p>

          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            style={styles.select}
          >
            <option value="starter">Starter — $99</option>
            <option value="growth">Growth — $199</option>
            <option value="domination">Domination — $399</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {step === 1 && (
            <>
              <label style={styles.label}>Email</label>
              <input
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />

              <button type="button" onClick={handleNext} style={styles.button}>
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <label style={styles.label}>Phone Number</label>
              <input
                placeholder="(555) 555-5555"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
              />

              <button type="submit" style={styles.button}>
                {loading ? "Redirecting..." : "Continue to Checkout"}
              </button>
            </>
          )}

          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0b1220",
    color: "white",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    background: "#111a2e",
    padding: 30,
    borderRadius: 12,
  },

  h1: { fontSize: 26, marginBottom: 10 },

  step: { fontSize: 14, opacity: 0.7 },

  badges: { fontSize: 12, opacity: 0.7, marginBottom: 15 },

  planBox: { marginBottom: 15 },

  select: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    background: "#0b1220",
    color: "white",
    border: "1px solid #333",
  },

  form: { display: "flex", flexDirection: "column", gap: 10 },

  label: { fontSize: 12 },

  input: {
    padding: 12,
    borderRadius: 8,
    background: "#0b1220",
    color: "white",
    border: "1px solid #333",
  },

  button: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    background: "#3b82f6",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },

  error: { color: "#ff6b6b", fontSize: 12 },
};
