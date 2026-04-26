import { PLANS } from "@/lib/stripe-plans";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    const role = PLANS[plan].role;

    await supabase.from("profiles").update({
      role,
      subscription_status: "active",
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
    }).eq("id", userId);
  }

  return Response.json({ received: true });
}