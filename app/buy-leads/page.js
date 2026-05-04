"use client";

import { useState } from "react";

// ⚠️ Move this to .env in production
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://your-render-app.onrender.com";

export default function BuyLeads() {
  const [loading, setLoading] = useState(null);

  // ===============================
  // STRIPE CHECKOUT HANDLER
  // ===============================
  const buyLead = async (priceId) => {
    try {
      setLoading(priceId);

      const res = await fetch(`${API_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          mode: "payment",
          metadata: {
            source: "lead_marketplace",
            product: "roofing_lead",
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error("Checkout failed");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err.message);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(null);
    }
  };

  // ===============================
  // PRODUCTS
  // ===============================
  const plans = [
    {
      name: "Hot Lead",
      price: "$49",
      id: "price_hot_lead",
      desc: "Recently submitted homeowner. High intent.",
      highlight: false,
      value: "low",
    },
    {
      name: "Verified Lead",
      price: "$99",
      id: "price_verified_lead",
      desc: "Phone + email verified. Ready to talk.",
      highlight: true,
      value: "medium",
    },
    {
      name: "Exclusive Lead",
      price: "$149",
      id: "price_exclusive_lead",
      desc: "Sold once. No competition. Highest close rate.",
      highlight: false,
      value: "high",
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-6 py-20 text-center">
      {/* HEADER */}
      <h1 className="text-4xl font-bold">
        Buy High-Intent Roofing Leads
      </h1>

      <p className="text-gray-600 mt-4">
        Real homeowners actively requesting roofing quotes — delivered instantly.
      </p>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-2xl p-6 transition ${
              plan.highlight
                ? "border-black shadow-lg scale-105"
                : "border-gray-200"
            }`}
          >
            {plan.highlight && (
              <p className="text-xs font-bold mb-2">MOST POPULAR</p>
            )}

            <h2 className="text-xl font-bold">{plan.name}</h2>

            <p className="text-3xl font-bold mt-2">{plan.price}</p>

            <p className="text-gray-500 mt-2 text-sm">{plan.desc}</p>

            {/* CTA */}
            <button
              onClick={() => buyLead(plan.id)}
              disabled={loading === plan.id}
              className={`mt-6 w-full py-3 rounded-lg font-medium transition ${
                loading === plan.id
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:opacity-90"
              }`}
            >
              {loading === plan.id ? "Processing..." : "Buy Now"}
            </button>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <p className="text-xs text-gray-400 mt-10">
        Limited supply per city. Leads are routed instantly after purchase.
      </p>
    </main>
  );
}