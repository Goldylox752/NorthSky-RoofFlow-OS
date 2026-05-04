import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ===============================
// INIT STRIPE
// ===============================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// ===============================
// SUPABASE (SERVICE ROLE REQUIRED)
// ===============================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ===============================
// STRIPE WEBHOOK (PRODUCTION)
// ===============================
export async function POST(req) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event;

    // ===============================
    // VERIFY SIGNATURE
    // ===============================
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Invalid Stripe signature:", err.message);
      return new Response(`Webhook Error: ${err.message}`, {
        status: 400,
      });
    }

    // ===============================
    // ROUTE EVENTS
    // ===============================
    switch (event.type) {

      // =========================================
      // 1. CHECKOUT COMPLETED (CITY / PLAN PURCHASE)
      // =========================================
      case "checkout.session.completed": {
        const session = event.data.object;

        const email = session.customer_details?.email;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        const city = session.metadata?.city || null;

        if (!email) {
          return Response.json(
            { error: "Missing email" },
            { status: 400 }
          );
        }

        // ===============================
        // UPSERT CONTRACTOR
        // ===============================
        const { data: contractor, error: contractorError } =
          await supabase
            .from("contractors")
            .upsert(
              {
                email,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                plan: city ? "city_exclusive" : "pro",
                active: true,
                city: city || null,
              },
              { onConflict: "email" }
            )
            .select()
            .single();

        if (contractorError) {
          console.error("❌ Contractor upsert error:", contractorError.message);
          break;
        }

        // ===============================
        // CITY ASSIGNMENT LOGIC
        // ===============================
        if (city) {
          const { data: cityRow } = await supabase
            .from("cities")
            .select("*")
            .eq("city", city)
            .single();

          if (cityRow) {
            const updated = [
              ...(cityRow.active_contractors || []),
              contractor.id,
            ];

            await supabase
              .from("cities")
              .update({
                active_contractors: updated,
                status:
                  updated.length >= cityRow.max_contractors
                    ? "sold"
                    : "limited",
              })
              .eq("city", city);
          }
        }

        break;
      }

      // =========================================
      // 2. SUBSCRIPTION UPDATED
      // =========================================
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

      // =========================================
      // 3. SUBSCRIPTION CANCELED
      // =========================================
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

      // =========================================
      // DEFAULT
      // =========================================
      default:
        console.log("⚠️ Unhandled event:", event.type);
    }

    // ===============================
    // RESPONSE
    // ===============================
    return Response.json({ received: true });

  } catch (err) {
    console.error("🔥 Webhook failure:", err.message);

    return Response.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}