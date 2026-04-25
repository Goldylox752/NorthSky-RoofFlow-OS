import Stripe from "stripe";
import { aiScoreLead } from "@/lib/aiScoreLead";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { email, phone, answers = {} } = await req.json();

    // 🤖 AI LEAD SCORING
    const ai = await aiScoreLead({ email, phone, answers });

    const leadScore = ai.score;

    // 🚨 BLOCK LOW QUALITY LEADS BEFORE STRIPE
    if (leadScore < 65) {
      return new Response(
        JSON.stringify({
          error: "Not qualified",
          reason: ai.reason,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 💳 CREATE STRIPE SESSION
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,

      customer_email: email,

      metadata: {
        email,
        phone,
        score: leadScore,
        ai_reason: ai.reason,
        source: "roofflow_ai",
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    return new Response("Error creating checkout session", { status: 500 });
  }
}
