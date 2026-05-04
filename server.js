"use strict";

// =====================
// ENV SETUP
// =====================
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// =====================
// IMPORTS
// =====================
const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const Stripe = require("stripe");

// =====================
// FETCH (Render-safe)
// =====================
const fetchFn =
  global.fetch ||
  ((...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args)));

// =====================
// INIT
// =====================
const app = express();

// =====================
// ENV
// =====================
const {
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE,
  STRIPE_SECRET_KEY,
  FRONTEND_URL,
  OLLAMA_URL,
  PORT,
} = process.env;

// =====================
// DEBUG
// =====================
console.log("ENV STATUS:", {
  TWILIO: !!(TWILIO_SID && TWILIO_AUTH_TOKEN),
  STRIPE: !!STRIPE_SECRET_KEY,
  OLLAMA: !!OLLAMA_URL,
  FRONTEND: !!FRONTEND_URL,
});

// =====================
// CLIENTS
// =====================
const twilioClient =
  TWILIO_SID && TWILIO_AUTH_TOKEN
    ? twilio(TWILIO_SID, TWILIO_AUTH_TOKEN)
    : null;

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
  : null;

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(cors({ origin: FRONTEND_URL || "*", methods: ["GET", "POST"] }));

// =====================
// HEALTH CHECK
// =====================
app.get("/", (_, res) => {
  res.status(200).send("🚀 RoofFlow SaaS API LIVE");
});

// ======================================================
// 💰 MONETIZATION CONFIG
// ======================================================

// Lead pricing ($15–$50)
const LEAD_PRICING = {
  low: 1500,
  mid: 3000,
  high: 5000,
};

// Subscription tiers ($99–$499)
const SUBSCRIPTIONS = {
  starter: 9900,
  growth: 19900,
  elite: 49900,
};

// City exclusivity multiplier
const CITY_TIERS = {
  basic: 1,
  priority: 1.5,
  exclusive: 3,
};

// =====================
// LEAD VALUE ENGINE
// =====================
function calculateLeadPrice(score = 5, cityTier = "basic") {
  let base;

  if (score >= 8) base = LEAD_PRICING.high;
  else if (score >= 6) base = LEAD_PRICING.mid;
  else base = LEAD_PRICING.low;

  const multiplier = CITY_TIERS[cityTier] || 1;

  return Math.round(base * multiplier);
}

// =====================
// CONTRACTOR TIER ENGINE
// =====================
function getContractorTier(plan) {
  if (plan === "elite") return 3;
  if (plan === "growth") return 2;
  return 1;
}

// =====================
// AI FALLBACK
// =====================
const FALLBACK_REPLY =
  "Are you available this week for a quick roof inspection?";

async function askOllama(prompt) {
  if (!OLLAMA_URL) return FALLBACK_REPLY;

  try {
    const res = await fetchFn(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        messages: [
          {
            role: "system",
            content:
              "You are a roofing sales assistant. Ask ONE short question to move toward booking.",
          },
          { role: "user", content: prompt || "" },
        ],
        stream: false,
      }),
    });

    const data = await res.json();
    return data?.message?.content || FALLBACK_REPLY;
  } catch {
    return FALLBACK_REPLY;
  }
}

// =====================
// DRIP SYSTEM
// =====================
function dripSequence() {
  return [
    { delay: 0, text: "Thanks — we received your request." },
    { delay: 3600000, text: "Limited contractor availability in your area." },
    { delay: 86400000, text: "Still interested in roofing estimates?" },
    { delay: 172800000, text: "Final reminder — slots are closing." },
  ];
}

function sendDrip(phone, messages) {
  if (!twilioClient || !phone) return;

  for (const msg of messages) {
    setTimeout(async () => {
      try {
        await twilioClient.messages.create({
          body: msg.text,
          from: TWILIO_PHONE,
          to: phone,
        });
      } catch (err) {
        console.error("Drip error:", err.message);
      }
    }, msg.delay);
  }
}

// =====================
// LEAD CAPTURE (MONETIZED READY)
// =====================
app.post("/api/lead", async (req, res) => {
  try {
    const { phone, score = 5, cityTier = "basic" } = req.body || {};

    if (!phone) {
      return res.status(400).json({ error: "Missing phone" });
    }

    // 💰 CALCULATE LEAD VALUE
    const leadValue = calculateLeadPrice(score, cityTier);

    console.log("💰 Lead Value:", leadValue);

    // SMS confirmation
    if (twilioClient) {
      await twilioClient.messages.create({
        body: `Thanks — your request is received. Estimated value: $${leadValue / 100}`,
        from: TWILIO_PHONE,
        to: phone,
      });
    }

    sendDrip(phone, dripSequence());

    return res.json({
      success: true,
      leadValue,
    });
  } catch (err) {
    console.error("Lead error:", err.message);
    return res.status(500).json({ error: "Lead error" });
  }
});

// =====================
// STRIPE CHECKOUT (SUBSCRIPTIONS)
// =====================
app.post("/api/checkout", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const { plan, email, phone } = req.body || {};
    const amount = SUBSCRIPTIONS[plan];

    if (!amount) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email || undefined,

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `RoofFlow ${plan.toUpperCase()} Plan`,
              description: "Access exclusive roofing leads & territory system",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],

      success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/cancel`,

      metadata: {
        email,
        phone,
        plan,
      },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err.message);
    return res.status(500).json({ error: "Checkout failed" });
  }
});

// =====================
// SMS AI WEBHOOK
// =====================
app.post("/sms", async (req, res) => {
  try {
    const msg = req.body?.Body;
    const from = req.body?.From;

    if (!msg || !from) return res.sendStatus(200);

    const reply = await askOllama(msg);

    if (twilioClient) {
      await twilioClient.messages.create({
        body: reply,
        from: TWILIO_PHONE,
        to: from,
      });
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("SMS error:", err.message);
    return res.sendStatus(200);
  }
});

// =====================
// START SERVER
// =====================
const serverPort = PORT || 3000;

app.listen(serverPort, () => {
  console.log(`🚀 RoofFlow SaaS running on port ${serverPort}`);
});

module.exports = app;