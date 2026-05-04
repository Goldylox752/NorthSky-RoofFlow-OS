"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [status, setStatus] = useState("verifying"); // verifying | active | error
  const [message, setMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const verify = async () => {
      try {
        const session_id = new URLSearchParams(window.location.search).get(
          "session_id"
        );

        if (!session_id) {
          setStatus("error");
          setMessage("Missing session ID");
          return;
        }

        if (!API_URL) {
          setStatus("error");
          setMessage("Backend not configured");
          return;
        }

        const res = await fetch(
          `${API_URL}/api/stripe/verify-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ session_id }),
          }
        );

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || "Verification failed");
        }

        setStatus("active");
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Payment verification failed");
      }
    };

    verify();
  }, []);

  // =====================
  // LOADING STATE
  // =====================
  if (status === "verifying") {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Verifying Payment...</h1>
          <p style={styles.text}>
            Activating your contractor account in real time.
          </p>
        </div>
      </main>
    );
  }

  // =====================
  // ERROR STATE
  // =====================
  if (status === "error") {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>⚠️ Something went wrong</h1>
          <p style={styles.text}>{message}</p>

          <div style={styles.actions}>
            <Link href="/" style={styles.secondaryBtn}>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =====================
  // SUCCESS STATE (REAL ACTIVATION CONFIRMED)
  // =====================
  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎉 You're Activated</h1>

        <p style={styles.text}>
          Your contractor account is now live in the RoofFlow system.
        </p>

        <p style={styles.subtext}>
          You will start receiving exclusive roofing leads as they come in.
        </p>

        <div style={styles.statusBox}>
          <p>✔ Stripe subscription confirmed</p>
          <p>✔ Contractor activated in system</p>
          <p>✔ Lead routing enabled</p>
        </div>

        <p style={styles.note}>
          First leads may arrive within minutes depending on your city demand.
        </p>

        <div style={styles.actions}>
          <Link href="/dashboard" style={styles.primaryBtn}>
            Go to Dashboard
          </Link>

          <Link href="/" style={styles.secondaryBtn}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}