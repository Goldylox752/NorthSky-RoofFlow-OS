import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ===============================
// STRIPE WEBHOOK (PRODUCTION)
// Handles subscriptions + checkout + activation
// ===============================
export async function POST(req) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event;

    // ===============================
    // VERIFY WEBHOOK SIGNATURE
    // ===============================
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Stripe signature error:", err.message);
      return new Response(`Webhook Error: ${err.message}`, {
        status: 400,
      });
    }

    // ===============================
    // EVENT ROUTING
    // ===============================
    switch (event.type) {

      // ===============================
      // 1. CHECKOUT COMPLETED
      // ===============================
      case "checkout.session.completed": {
        const session = event.data.object;

        const email = session.customer_details?.email;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (!email) {
          return Response.json(
            { error: "Missing customer email" },
            { status: 400 }
          );
        }

        // UPSERT contractor subscription record
        const { error } = await supabase
          .from("contractors")
          .upsert(
            {
              email,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan: "pro",
              active: true,
            },
            {
              onConflict: "email",
            }
          );

        if (error) {
          console.error("❌ Supabase error:", error.message);
        }

        break;
      }

      // ===============================
      // 2. SUBSCRIPTION UPDATED
      // ===============================
      case "customer.subscription.updated": {
        const sub = event.data.object;

        const customerId = sub.customer;
        const status = sub.status;

        await supabase
          .from("contractors")
          .update({
            active: status === "active",
          })
          .eq("stripe_customer_id", customerId);

        break;
      }

      // ===============================
      // 3. SUBSCRIPTION DELETED
      // ===============================
      case "customer.subscription.deleted": {
        const sub = event.data.object;

        await supabase
          .from("contractors")
          .update({
            active: false,
            plan: "free",
          })
          .eq("stripe_customer_id", sub.customer);

        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    // ===============================
    // RESPONSE
    // ===============================
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200 }
    );

  } catch (err) {
    console.error("🔥 Webhook error:", err);

    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}