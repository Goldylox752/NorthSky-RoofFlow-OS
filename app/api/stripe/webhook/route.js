import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ===============================
// INIT
// ===============================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ===============================
// IDEMPOTENCY GUARD (PREVENT DOUBLE PROCESSING)
// ===============================
async function alreadyProcessed(eventId) {
  const { data } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("id", eventId)
    .single();

  return !!data;
}

async function markProcessed(eventId) {
  await supabase.from("stripe_events").insert({
    id: eventId,
    processed_at: new Date().toISOString(),
  });
}

// ===============================
// WEBHOOK
// ===============================
export async function POST(req) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event;

    // ===============================
    // VERIFY STRIPE SIGNATURE
    // ===============================
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Stripe signature error:", err.message);
      return new Response("Invalid signature", { status: 400 });
    }

    // ===============================
    // IDEMPOTENCY CHECK
    // ===============================
    if (await alreadyProcessed(event.id)) {
      return Response.json({ received: true, duplicate: true });
    }

    // ===============================
    // ROUTER
    // ===============================
    switch (event.type) {

      // =====================================================
      // 🏙 CITY PURCHASE / CONTRACTOR ACTIVATION
      // =====================================================
      case "checkout.session.completed": {
        const session = event.data.object;

        const email = session.customer_details?.email;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const city = session.metadata?.city;

        if (!email) break;

        // ===============================
        // UPSERT CONTRACTOR
        // ===============================
        const { data: contractor } = await supabase
          .from("contractors")
          .upsert(
            {
              email,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              active: true,
              plan: city ? "city_owner" : "pro",
              city: city || null,
            },
            { onConflict: "email" }
          )
          .select()
          .single();

        if (!contractor) break;

        // ===============================
        // CITY OWNERSHIP ENFORCEMENT (NO DUPLICATES)
        // ===============================
        if (city) {
          const { data: cityRow } = await supabase
            .from("cities")
            .select("*")
            .eq("city", city)
            .single();

          if (cityRow) {
            const existing = cityRow.active_contractors || [];

            if (!existing.includes(contractor.id)) {
              const updated = [...existing, contractor.id];

              await supabase
                .from("cities")
                .update({
                  active_contractors: updated,

                  // 🔒 enforce exclusivity state machine
                  status:
                    updated.length >= cityRow.max_contractors
                      ? "sold"
                      : "active",
                })
                .eq("city", city);
            }
          }

          // ===============================
          // CLEAN INTENT TABLE (FINALIZE PURCHASE)
          // ===============================
          await supabase
            .from("city_intents")
            .update({
              status: "confirmed",
            })
            .eq("city", city)
            .eq("contractorId", contractor.id);
        }

        break;
      }

      // =====================================================
      // 🔄 SUBSCRIPTION ACTIVATION
      // =====================================================
      case "customer.subscription.updated": {
        const sub = event.data.object;

        await supabase
          .from("contractors")
          .update({
            active: sub.status === "active",
          })
          .eq("stripe_customer_id", sub.customer);

        break;
      }

      // =====================================================
      // ❌ SUBSCRIPTION CANCELED
      // =====================================================
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
        console.log("⚠️ Unhandled event:", event.type);
    }

    // ===============================
    // MARK EVENT PROCESSED
    // ===============================
    await markProcessed(event.id);

    return Response.json({ received: true });

  } catch (err) {
    console.error("🔥 Webhook crash:", err.message);

    return Response.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}