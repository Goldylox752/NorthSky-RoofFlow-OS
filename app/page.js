"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const [loadingPlan, setLoadingPlan] = useState(null);

  const trackCTA = async (event) => {
    if (!API_BASE) return;

    try {
      await fetch(`${API_BASE}/api/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          page: "/",
          timestamp: Date.now(),
        }),
      });
    } catch {
      // silent fail (don’t break UI)
    }
  };

  useEffect(() => {
    let tracked = false;

    const onScroll = () => {
      const height =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress = window.scrollY / height;

      if (progress > 0.5 && !tracked) {
        tracked = true;
        trackCTA("scroll_50");
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const checkout = async (plan) => {
    if (!API_BASE) {
      alert("Backend not connected");
      return;
    }

    setLoadingPlan(plan);

    try {
      const res = await fetch(`${API_BASE}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          email: "demo@roofflow.ai",
          phone: "+10000000000",
        }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main style={styles.page}>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.logo}>RoofFlow AI</div>

        <div style={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/apply">Apply</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.badge}>🚀 Exclusive Roofing Leads</div>

        <h1 style={styles.h1}>
          High-Intent Roofing Jobs<br />Delivered Daily
        </h1>

        <p style={styles.sub}>
          We connect contractors with homeowners actively requesting roofing estimates.
        </p>

        <div style={styles.ctaRow}>
          <button
            onClick={() => {
              trackCTA("growth_click");
              checkout("growth");
            }}
            style={styles.primaryBtn}
            disabled={loadingPlan === "growth"}
          >
            {loadingPlan === "growth" ? "Processing..." : "Get Growth Plan"}
          </button>

          <button
            onClick={() => trackCTA("pricing_click")}
            style={styles.secondaryBtn}
          >
            Learn More
          </button>
        </div>

        <p style={styles.small}>Limited contractors per city</p>
      </section>

      {/* VALUE */}
      <section style={styles.card}>
        <h2>Why Contractors Use RoofFlow</h2>
        <ul>
          <li>✔ Exclusive leads (no sharing)</li>
          <li>✔ Pre-qualified homeowners</li>
          <li>✔ AI filtering system</li>
          <li>✔ Automated follow-up</li>
        </ul>
      </section>

      {/* HOW IT WORKS */}
      <section style={styles.card}>
        <h2>How It Works</h2>
        <ul>
          <li>1. Homeowner submits request</li>
          <li>2. AI qualifies urgency</li>
          <li>3. Lead is sent to you</li>
          <li>4. SMS follow-up runs automatically</li>
        </ul>
      </section>

      {/* FINAL CTA */}
      <section style={styles.final}>
        <h2>Ready to Start Getting Jobs?</h2>

        <button
          onClick={() => checkout("growth")}
          style={styles.primaryBtn}
          disabled={loadingPlan === "growth"}
        >
          {loadingPlan === "growth" ? "Redirecting..." : "Get Access Now"}
        </button>
      </section>

    </main>
  );
}