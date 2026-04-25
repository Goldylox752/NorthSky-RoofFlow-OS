import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🔥 MUST BE STRIPE RECURRING PRICE IDs (NOT amounts)
const PRICES = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  growth: process.env.STRIPE_GROWTH_PRICE_ID,
  domination: process.env.STRIPE_DOMINATION_PRICE_ID,
};

export async function POST(req) {
  try {
    const { plan, email, phone } = await req.json();

    if (!PRICES[plan]) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // 🔥 CRITICAL FIX

      payment_method_types: ["card"],

      line_items: [
        {
          price: PRICES[plan], // 🔥 recurring price ID
          quantity: 1,
        },
      ],

      metadata: {
        plan,
        email: email || "",
        phone: phone || "",
      },

      success_url: `${process.env.BASE_URL}/success`,
      cancel_url: `${process.env.BASE_URL}/apply`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    return Response.json({ error: "Checkout failed" }, { status: 500 });
  }
}
