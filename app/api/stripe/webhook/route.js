import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ===============================
// 🔐 EVENT LOCK WITH TIMEOUT SAFETY
// ===============================
async function lockEvent(eventId, type) {
  const { error } = await supabase.from("stripe_events").insert({
    id: eventId,
    type,
    status: "processing",
    created_at: new Date().toISOString(),
    locked_at: new Date().toISOString(),
  });

  return !error;
}

// ===============================
// 🔁 RECOVERY: UNSTUCK EVENTS (CRITICAL UPGRADE)
// ===============================
async function recoverStuckEvents() {
  const cutoff = new Date(Date.now() - 1000 * 60 * 5); // 5 min

  await supabase
    .from("stripe_events")
    .update({ status: "failed", error: "timeout_recovered" })
    .eq("status", "processing")
    .lt("locked_at", cutoff.toISOString());
}

// ===============================
// MARKERS
// ===============================
async function markSuccess(eventId) {
  await supabase
    .from("stripe_events")
    .update({
      status: "completed",
      processed_at: new Date().toISOString(),
    })
    .eq("id", eventId);
}

async function markFailed(eventId, error) {
  await supabase
    .from("stripe_events")
    .update({
      status: "failed",
      error: error?.message || "unknown error",
    })
    .eq("id", eventId);
}

// ===============================
// CITY UPDATE (UNCHANGED BUT SAFE)
// ===============================
async function updateCity(city, contractorId, cityRow) {
  const existing = cityRow.active_contractors || [];

  if (existing.includes(contractorId)) return;

  const updated = [...existing, contractorId];

  await supabase
    .from("cities")
    .update({
      active_contractors: updated,
      status:
        updated.length >= cityRow.max_contractors
          ? "sold"
          : "active",
    })
    .eq("city", city);
}

// ===============================
// MAIN WEBHOOK
// ===============================
export async function POST(req) {
  let event;

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    // ===============================
    // VERIFY STRIPE SIGNATURE
    // ===============================
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // ===============================
    // 🔐 IDEMPOTENCY + LOCK
    // ===============================
    const locked = await lockEvent(event.id, event.type);

    if (!locked) {
      return Response.json({ duplicate: true, received: true });
    }

    // ===============================
    // PROCESS EVENT
    // ===============================
    switch (event.type) {

      // =====================================================
      // CHECKOUT COMPLETE
      // =====================================================
      case "checkout.session.completed": {
        const session = event.data.object;

        const email = session.customer_details?.email;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const city = session.metadata?.city;

        if (!email) break;

        const { data: contractor, error } = await supabase
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

        if (error || !contractor) {
          throw new Error("Contractor upsert failed");
        }

        if (city) {
          const { data: cityRow } = await supabase
            .from("cities")
            .select("*")
            .eq("city", city)
            .single();

          if (cityRow) {
            await updateCity(city, contractor.id, cityRow);
          }

          await supabase
            .from("city_intents")
            .update({ status: "confirmed" })
            .eq("city", city)
            .eq("contractorId", contractor.id);
        }

        await supabase.from("events").insert({
          type: "stripe.checkout.completed",
          contractor_id: contractor.id,
          payload: session,
        });

        break;
      }

      // =====================================================
      // SUBSCRIPTION UPDATED
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
      // SUBSCRIPTION CANCELLED
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
    }

    // ===============================
    // SUCCESS MARK
    // ===============================
    await markSuccess(event.id);

    return Response.json({ received: true });

  } catch (err) {
    console.error("Webhook crash:", err);

    if (event?.id) {
      await markFailed(event.id, err);
    }

    return Response.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}