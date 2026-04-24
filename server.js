import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// ✅ CREATE APP FIRST (this is what you're missing)
const app = express();

// ✅ INIT STRIPE
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ WEBHOOK (must be BEFORE express.json)
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("Webhook:", event.type);

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// ✅ NORMAL MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ✅ CHECKOUT ROUTE
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: req.body.priceId,
          quantity: 1
        }
      ],
      success_url: "https://yourdomain.com/success",
      cancel_url: "https://yourdomain.com/cancel"
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).send("Stripe error");
  }
});

// ✅ START SERVER
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
