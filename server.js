if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const Stripe = require("stripe");

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
  OLLAMA_URL, // 👈 ADD THIS (IMPORTANT)
} = process.env;

// =====================
// SAFE INIT (NO CRASH)
// =====================
const twilioClient =
  TWILIO_SID && TWILIO_AUTH_TOKEN
    ? twilio(TWILIO_SID, TWILIO_AUTH_TOKEN)
    : null;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// =====================
// MIDDLEWARE
// =====================
app.use(cors({ origin: FRONTEND_URL || "*" }));
app.use(express.json());

// =====================
// OLLAMA FUNCTION (FIXED FOR VPS)
// =====================
async function askOllama(prompt) {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        messages: [
          { role: "system", content: "Short helpful assistant." },
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
    });

    const data = await res.json();
    return data?.message?.content || "No response";
  } catch (err) {
    console.error("Ollama error:", err.message);

    // fallback so SMS NEVER breaks
    return "Thanks for your message — we’ll get back shortly.";
  }
}

// =====================
// PRICING
// =====================
const PLANS = {
  starter: 49900,
  growth: 99900,
  domination: 199900,
};

// =====================
// DRIP SYSTEM
// =====================
function dripSequence() {
  return [
    { delay: 0, text: "Thanks — we received your request." },
    { delay: 3600000, text: "We only accept limited contractors per area." },
    { delay: 86400000, text: "Still interested in exclusive roofing leads?" },
    { delay: 172800000, text: "Final reminder — spots are almost full." },
  ];
}

function sendDrip(phone, messages) {
  if (!twilioClient) return;

  messages.forEach((msg) => {
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
  });
}

// =====================
// HEALTH
// =====================
app.get("/", (req, res) => {
  res.send("🚀 RoofFlow API LIVE (Ollama + Safe Mode)");
});

// =====================
// CHECKOUT (SAFE)
// =====================
app.post("/api/checkout", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const { plan, email, phone } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `RoofFlow AI - ${plan}` },
            unit_amount: PLANS[plan],
          },
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/success`,
      cancel_url: `${FRONTEND_URL}/cancel`,
      metadata: { email, phone, plan },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// =====================
// LEAD
// =====================
app.post("/api/lead", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) return res.status(400).json({ error: "Missing phone" });

    if (twilioClient) {
      await twilioClient.messages.create({
        body: "Thanks — we’ll follow up shortly.",
        from: TWILIO_PHONE,
        to: phone,
      });
    }

    sendDrip(phone, dripSequence());

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lead error" });
  }
});

// =====================
// SMS BOT (OLLAMA)
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

    res.sendStatus(200);
  } catch (err) {
    console.error("SMS error:", err.message);
    res.sendStatus(200);
  }
});

module.exports = app;