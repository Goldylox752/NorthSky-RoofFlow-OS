"use client";

import { useState } from "react";

export default function Page() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [leadId, setLeadId] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!form.email || !form.phone) {
      alert("Email and phone are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: "landing_page",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Request failed");
      }

      setLeadId(data.lead?.id || null);
      setSuccess(true);

      setForm({
        name: "",
        email: "",
        phone: "",
        city: "",
      });
    } catch (err) {
      alert("Submission failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>

        {/* =========================
            HERO (CONVERSION LAYER)
        ========================= */}
        <h1 style={styles.h1}>
          Exclusive Roofing Leads.<br />
          <span style={{ color: "#00ffb3" }}>
            Only 1 Contractor Per City.
          </span>
        </h1>

        <p style={styles.subtext}>
          Get high-intent homeowners ready to hire.
          Leads range from <b>$15–$50 each</b> and are never shared.
        </p>

        {/* TRUST BAR */}
        <div style={styles.trustBar}>
          ✔ Verified homeowners  
          ✔ Real-time routing  
          ✔ No shared leads  
        </div>

        {/* =========================
            SUCCESS STATE
        ========================= */}
        {success ? (
          <div style={styles.successBox}>
            <h2>Application Received ✔</h2>

            <p>
              Your contractor profile is under review.
            </p>

            <p style={styles.meta}>
              Tracking ID: <b>{leadId}</b>
            </p>

            <p style={styles.nextSteps}>
              You will be notified once your city access is approved.
            </p>
          </div>
        ) : (
          <div style={styles.formBox}>

            <h3 style={styles.formTitle}>
              Apply for Exclusive Access
            </h3>

            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={styles.input} />
            <input name="email" placeholder="Email *" value={form.email} onChange={handleChange} style={styles.input} />
            <input name="phone" placeholder="Phone *" value={form.phone} onChange={handleChange} style={styles.input} />
            <input name="city" placeholder="Service City" value={form.city} onChange={handleChange} style={styles.input} />

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Processing..."
                : "Get Exclusive Leads Access"}
            </button>

            <p style={styles.micro}>
              ⚡ Limited to 1–3 contractors per city
            </p>
          </div>
        )}

        {/* =========================
            VALUE STACK SECTION
        ========================= */}
        <div style={styles.valueBox}>
          <h3>Why Contractors Join</h3>

          <ul>
            <li>🔥 Exclusive city territories</li>
            <li>💰 Pay-per-lead model ($15–$50)</li>
            <li>📍 High-intent homeowners only</li>
            <li>⚡ Instant lead routing system</li>
          </ul>
        </div>
      </div>
    </main>
  );
}