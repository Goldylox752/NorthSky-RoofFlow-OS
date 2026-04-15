require("dotenv").config();

const express = require("express");
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// =========================
// INIT
// =========================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// =========================
// SECURITY MIDDLEWARE (ORDER MATTERS)
// =========================
app.use(cors({
  origin: "*"
}));

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 60
}));

app.use(express.json({ limit: "1mb" }));

// =========================
// HEALTH CHECK
// =========================
app.get("/", (_, res) => {
  res.status(200).send("🚀 RoofFlow API Running");
});

// =========================
// LEAD SCORING
// =========================
function scoreLead(issue = "") {
  const text = issue.toLowerCase();

  if (text.includes("leak")) return 95;
  if (text.includes("storm")) return 90;
  if (text.includes("replacement")) return 85;

  return 75;
}

// =========================
// STRIPE CHECKOUT
// =========================
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { email, name, phone, city } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: "RoofFlow Lead System" },
          unit_amount: 49700,
          recurring: { interval: "month" }
        },
        quantity: 1
      }],
      metadata: { email, name, phone, city },
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL
    });

    res.json({ id: session.id });

  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// =========================
// STRIPE WEBHOOK (FIXED ORDER)
// =========================
app.post(
  "/api/stripe-webhook",
  bodyParser.raw({ type: "application/json" }),
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
      return res.status(400).send("Invalid signature");
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { email } = session.metadata || {};

        if (email) {
          await supabase
            .from("contractors")
            .update({
              active: true,
              stripe_customer_id: session.customer
            })
            .eq("email", email);
        }
      }

      res.json({ received: true });

    } catch (err) {
      console.error("Webhook error:", err.message);
      res.status(500).json({ error: "Webhook failed" });
    }
  }
);

// =========================
// NEW LEAD ROUTER (SCALABLE)
// =========================
app.post("/api/new-lead", async (req, res) => {
  try {
    const { name, phone, city, issue } = req.body;

    if (!name || !phone || !city) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const score = scoreLead(issue);

    // 1. Save lead
    const { data: lead, error } = await supabase
      .from("homeowner_leads")
      .insert([{ name, phone, city, issue, score }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 2. Get contractors (fair distribution)
    const { data: contractors } = await supabase
      .from("contractors")
      .select("*")
      .eq("city", city)
      .eq("active", true)
      .order("leads_received", { ascending: true });

    if (!contractors?.length) {
      return res.json({ success: true, message: "No contractors" });
    }

    const contractor = contractors.find(
      c => (c.leads_received || 0) < (c.max_leads || 20)
    );

    if (!contractor) {
      return res.json({ success: true, message: "All full" });
    }

    // 3. Async SMS (NON BLOCKING)
    fetch(process.env.SMS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: contractor.phone,
        message: `🔥 Lead ${score}/100\n${city}\n${issue}\n${phone}`
      })
    }).catch(console.error);

    // 4. Update usage
    await supabase
      .from("contractors")
      .update({
        leads_received: (contractor.leads_received || 0) + 1
      })
      .eq("id", contractor.id);

    res.json({ success: true, routed: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lead routing failed" });
  }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 RoofFlow running on port ${PORT}`);
});