"use client";

import { useState, useMemo } from "react";

export default function Apply() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("growth");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const normalizePhone = (v) => v.replace(/\D/g, "");

  const isValidPhone = (v) => {
    const cleaned = normalizePhone(v);
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const resetError = () => setError("");

  const leadScore = useMemo(() => {
    return (isValidEmail(email) ? 50 : 0) +
           (isValidPhone(phone) ? 50 : 0);
  }, [email, phone]);

  const handleNext = () => {
    resetError();

    if (!isValidEmail(email)) {
      setError("Please enter a valid business email.");
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetError();

    if (!isValidPhone(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (leadScore < 80) {
      setError("We only accept qualified roofing contractors.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ SAVE LEAD FIRST (CRITICAL)
      await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          plan,
          lead_score: leadScore,
          source: "apply_form",
        }),
      });

      // 2️⃣ STRIPE CHECKOUT
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          plan,
          leadScore,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Checkout failed");
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Apply to RoofFlow</h1>

        <p style={styles.subtext}>
          Automated roofing appointments delivered directly to your pipeline
        </p>

        <p style={styles.step}>Step {step} of 2</p>

        <p style={styles.badges}>
          🔒 Secure · ⚡ Instant qualification · 🏠 Exclusive territories
        </p>

        <div style={styles.planBox}>
          <p style={styles.labelSmall}>Select Plan</p>

          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            style={styles.select}
          >
            <option value="starter">Starter — $499/mo</option>
            <option value="growth">Growth — $999/mo</option>
            <option value="domination">Domination — $1,999/mo</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {step === 1 && (
            <>
              <label style={styles.label}>Business Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 555-5555"
                style={styles.input}
              />

              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? "Redirecting..." : "Continue to Payment"}
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
    padding: 28,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },

  h1: { fontSize: 26, marginBottom: 6 },
  subtext: { fontSize: 13, opacity: 0.7, marginBottom: 10 },
  step: { fontSize: 14, opacity: 0.7 },
  badges: { fontSize: 12, opacity: 0.7, marginBottom: 15 },

  planBox: { marginBottom: 15 },
  labelSmall: { fontSize: 12, marginBottom: 6, opacity: 0.8 },

  select: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    background: "#0b1220",
    color: "white",
    border: "1px solid #333",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  label: { fontSize: 12, opacity: 0.8 },

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

  error: {
    color: "#ff6b6b",
    fontSize: 12,
  },
};
