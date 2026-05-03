// =====================
// ENV SETUP
// =====================
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const OpenAI = require("openai");
const Stripe = require("stripe");

const app = express();

// =====================
// MIDDLEWARE
// =====================
// Stripe webhook needs raw body
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" })
);

app.use(cors());
app.use(express.json());

// =====================
// ENV
// =====================
const {
  OPENAI_API_KEY,
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE,
  STRIPE_SECRET_KEY,
  PORT,
} = process.env;

// =====================
// SAFETY CHECK
// =====================
const requiredEnv = [
  "OPENAI_API_KEY",
  "TWILIO_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE",
  "STRIPE_SECRET_KEY",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing env variable: ${key}`);
    process.exit(1);
  }
}

// =====================
// INIT SERVICES
// =====================
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

const stripe = new Stripe(STRIPE_SECRET_KEY);

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
    {
      delay: 0,
      text: "Thanks — we received your request and are reviewing it now.",
    },
    {
      delay: 60 * 60 * 1000,
      text: "Quick update: we only accept a limited number of contractors per area.",
    },
    {
      delay: 24 * 60 * 60 * 1000,
      text: "Still interested in exclusive leads in your area?",
    },
    {
      delay: 48 * 60 * 60 * 1000,
      text: "Final reminder — availability is limited today.",
    },
  ];
}

function sendDrip(phone, messages) {
  messages.forEach((msg, i) => {
    setTimeout(async () => {
      try {
        await twilioClient.messages.create({
          body: msg.text,
          from: TWILIO_PHONE,
          to: phone,
        });

        console.log(`📤 Drip ${i + 1} sent to ${phone}`);
      } catch (err) {
        console.error("Drip error:", err.message);
      }
    }, msg.delay);
  });
}

// =====================
// HOME ROUTE
// =====================
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial; text-align:center; padding:50px;">
        <h1>🚀 AI Lead System Live</h1>
        <p>Stripe + Twilio + OpenAI + Drip System Active</p>
      </body>
    </html>
  `);
});

// =====================
// STRIPE CHECKOUT
// =====================
app.post("/api/checkout", async (req, res) => {
  try {
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
            product_data: {
              name: `AI Roofing Lead System - ${plan}`,
            },
            unit_amount: PLANS[plan],
          },
          quantity: 1,
        },
      ],

      success_url: "https://your-domain.com/success",
      cancel_url: "https://your-domain.com/cancel",

      metadata: {
        email,
        phone,
        plan,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// =====================
// STRIPE WEBHOOK
// =====================
app.post("/api/stripe/webhook", (req, res) => {
  let event;

  try {
    event = JSON.parse(req.body);
  } catch (err) {
    return res.status(400).send("Invalid webhook");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const phone = session.metadata?.phone;

    console.log("💰 PAYMENT SUCCESS:", session.metadata);

    if (phone) {
      sendDrip(phone, dripSequence());
    }
  }

  res.json({ received: true });
});

// =====================
// LEAD CAPTURE (FREE USERS / TEST MODE)
// =====================
app.post("/api/lead", async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await twilioClient.messages.create({
      body: "Thanks — we received your request and will follow up shortly.",
      from: TWILIO_PHONE,
      to: phone,
    });

    sendDrip(phone, dripSequence());

    res.json({ success: true });
  } catch (err) {
    console.error("Lead error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =====================
// SMS AI BOT
// =====================
app.post("/sms", async (req, res) => {
  try {
    const msg = req.body?.Body;
    const from = req.body?.From;

    if (!msg || !from) return res.sendStatus(200);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a short business assistant." },
        { role: "user", content: msg },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "Thanks — we’ll follow up.";

    await twilioClient.messages.create({
      body: reply,
      from: TWILIO_PHONE,
      to: from,
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("SMS error:", err);
    res.sendStatus(500);
  }
});

// =====================
// START SERVER
// =====================
const port = PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});