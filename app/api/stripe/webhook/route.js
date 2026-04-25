import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;

  // 🔒 Verify Stripe signature
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe webhook signature failed:", err.message);
    return new Response("Invalid signature", { status: 400 });
  }

  // 🔒 Idempotency check (prevents duplicate processing)
  const { data: alreadyProcessed } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("id", event.id)
    .single();

  if (alreadyProcessed) {
    return new Response("Already processed", { status: 200 });
  }

  try {
    // =========================
    // CHECKOUT COMPLETED EVENT
    // =========================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const email =
        session.customer_email ||
        session.customer_details?.email;

      const phone = session.metadata?.phone || "";
      const plan = session.metadata?.plan || "";
      const leadScore = session.metadata?.leadScore || "0";

      const validPlans = ["starter", "growth", "domination"];

      if (!email || !validPlans.includes(plan)) {
        console.error("❌ Invalid webhook payload", {
          email,
          plan,
        });
        return new Response("Invalid data", { status: 400 });
      }

      // =========================
      // UPSERT LEAD
      // =========================
      const { error } = await supabase.from("leads").upsert(
        {
          email,
          phone,
          plan,
          lead_score: Number(leadScore),
          status: "active",
          stripe_session_id: session.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "email",
        }
      );

      if (error) {
        console.error("❌ Supabase upsert error:", error.message);
      }

      // =========================
      // LOG EVENT (idempotency)
      // =========================
      await supabase.from("stripe_events").insert({
        id: event.id,
        type: event.type,
        created_at: new Date().toISOString(),
      });
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return new Response("Server error", { status: 500 });
  }
}
