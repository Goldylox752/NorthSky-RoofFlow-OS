"use client";

import { useState } from "react";

export default function Pricing() {
  const [loading, setLoading] = useState(null);

  const subscribe = async (priceId) => {
    if (loading) return;

    try {
      setLoading(priceId);

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          mode: "subscription",
          source: "pricing_page",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Checkout failed");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Try again.");
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Starter Territory",
      price: "$499 / month",
      desc: "5–10 exclusive roofing opportunities",
      id: "price_STARTER_ID",
      cta: "Lock Territory",
      highlight: false,
    },
    {
      name: "Growth Territory",
      price: "$999 / month",
      desc: "15–30 high-intent homeowners",
      id: "price_GROWTH_ID",
      cta: "Scale Leads",
      highlight: true,
    },
    {
      name: "Elite Exclusivity",
      price: "$1,999 / month",
      desc: "Full city control + priority routing",
      id: "price_DOMINATION_ID",
      cta: "Own Market",
      highlight: false,
    },
  ];

  return (
    <main className="bg-white text-gray-900">

      {/* SYSTEM STATUS BAR (ties into your backend reality) */}
      <div className="bg-black text-white text-center py-3 text-sm">
        ⚡ Live routing active — leads are assigned in real-time (1 contractor per city enforced)
      </div>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold">
          Exclusive Roofing Leads by Territory
        </h1>

        <p className="mt-4 text-gray-600">
          No shared leads. No bidding wars. Your routing system assigns homeowners to a single contractor per city.
        </p>

        <div className="mt-6 text-sm text-gray-500 space-y-1">
          <p>🔥 AI-qualified homeowners only</p>
          <p>⚡ Instant routing engine (no delays)</p>
          <p>📍 Territory lock enforced at database level</p>
        </div>
      </section>

      {/* PRICING */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl p-6 transition ${
              plan.highlight
                ? "border-2 border-black shadow-lg scale-105"
                : "border border-gray-200"
            }`}
          >
            {plan.highlight && (
              <p className="text-xs font-bold mb-2">MOST POPULAR</p>
            )}

            <h2 className="text-xl font-bold">{plan.name}</h2>
            <p className="text-2xl font-bold mt-2">{plan.price}</p>
            <p className="text-sm text-gray-500 mt-2">{plan.desc}</p>

            <button
              onClick={() => subscribe(plan.id)}
              disabled={loading === plan.id}
              className={`mt-6 w-full py-3 rounded-lg font-medium transition ${
                loading === plan.id
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:opacity-90"
              }`}
            >
              {loading === plan.id ? "Processing..." : `${plan.cta} →`}
            </button>

            <p className="text-xs text-gray-500 mt-3">
              Billing is locked to your territory. Cancelling removes routing priority.
            </p>
          </div>
        ))}
      </section>

      {/* PAY PER LEAD */}
      <section className="max-w-5xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-2xl font-bold">
          Or Buy Individual High-Intent Leads
        </h2>

        <p className="text-gray-600 mt-2">
          One-off leads pulled from the same routing engine.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-10 text-left">
          <div className="border rounded-xl p-6">
            <h3 className="font-bold">Hot Lead</h3>
            <p className="text-gray-600">$49</p>
            <p className="text-xs text-gray-500 mt-2">
              Newly submitted homeowner request
            </p>
          </div>

          <div className="border rounded-xl p-6">
            <h3 className="font-bold">Verified Lead</h3>
            <p className="text-gray-600">$99</p>
            <p className="text-xs text-gray-500 mt-2">
              Phone + intent validated
            </p>
          </div>

          <div className="border rounded-xl p-6">
            <h3 className="font-bold">Exclusive Lead</h3>
            <p className="text-gray-600">$149</p>
            <p className="text-xs text-gray-500 mt-2">
              Locked to one contractor only
            </p>
          </div>
        </div>

        <button
          onClick={() => (window.location.href = "/buy-leads")}
          className="mt-8 bg-gray-900 text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
        >
          Browse Live Leads →
        </button>
      </section>
    </main>
  );
}