import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ========================
// SUPABASE
// ========================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ========================
// SECURITY MIDDLEWARE
// ========================
app.use(cors());
app.use(express.json());

// Rate limit (anti-spam)
app.use("/api/new-lead", rateLimit({
  windowMs: 60 * 1000,
  max: 5
}));

// ========================
// STRIPE WEBHOOK (RAW BODY REQUIRED)
// ========================
app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ========================
    // SUBSCRIPTION ACTIVATION
    // ========================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const email = session.customer_details?.email;

      if (!email) return res.json({ received: true });

      await supabase
        .from("contractors")
        .update({ subscription_status: "active" })
        .eq("email", email);

      console.log("✅ Contractor activated:", email);
    }

    res.json({ received: true });
  }
);

// ========================
// LEAD SCORING ENGINE (FIXED)
// ========================
function scoreLead({ city, issue, timeline }) {
  let score = 0;

  const urgencyMap = {
    today: 50,
    this_week: 30,
    this_month: 10,
    researching: 0
  };

  score += urgencyMap[timeline] || 0;

  const text = (issue || "").toLowerCase();

  if (text.includes("leak")) score += 35;
  if (text.includes("emergency")) score += 40;
  if (text.includes("replacement")) score += 25;
  if (text.includes("insurance")) score += 20;

  const cityLower = (city || "").toLowerCase();
  if (cityLower.includes("edmonton")) score += 20;
  if (cityLower.includes("calgary")) score += 20;

  return Math.min(score, 100);
}

// ========================
// DISPATCH LOGIC (REAL VERSION)
// ========================
async function dispatchLead(lead) {
  const { data: contractors } = await supabase
    .from("contractors")
    .select("*")
    .eq("subscription_status", "active");

  if (!contractors || contractors.length === 0) return;

  for (const c of contractors) {
    console.log("📨 Sending lead to:", c.email);

    // 🔥 PLACEHOLDER: SMS / Email integration
    // sendSMS(c.phone, lead)
    // sendEmail(c.email, lead)
  }
}

// ========================
// LEAD ENDPOINT (FIXED)
// ========================
app.post("/api/new-lead", async (req, res) => {
  try {
    const { name, phone, city, issue, timeline } = req.body;

    if (!name || !phone || !city) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const score = scoreLead({ city, issue, timeline });

    const lead = {
      name,
      phone,
      city,
      issue,
      timeline,
      score,
      created_at: new Date()
    };

    // Save lead
    const { error } = await supabase
      .from("leads")
      .insert([lead]);

    if (error) throw error;

    // Dispatch logic
    if (score >= 70) {
      console.log("🔥 HOT LEAD");
      await dispatchLead(lead);
    } else if (score >= 40) {
      console.log("⚡ WARM LEAD");
      await dispatchLead(lead);
    } else {
      console.log("🧊 COLD LEAD STORED ONLY");
    }

    res.json({
      success: true,
      score
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========================
// HEALTH CHECK
// ========================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ========================
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 NorthSky backend running");
});
