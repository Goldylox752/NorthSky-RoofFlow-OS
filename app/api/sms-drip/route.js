import { createClient } from "@supabase/supabase-js";
import { sendSMS } from "@/lib/sendSMS";

// =====================
// SUPABASE CLIENT
// =====================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =====================
// DRIP AUTOMATION
// =====================
export async function GET() {
  try {
    const now = Date.now();

    const { data: leads, error } = await supabase
      .from("leads")
      .select("id, phone, created_at, status, stage")
      .eq("status", "active");

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { ok: false, error: "Database query failed" },
        { status: 500 }
      );
    }

    if (!leads || leads.length === 0) {
      return Response.json({
        ok: true,
        processed: 0,
        message: "No active leads found",
      });
    }

    const updates = [];

    for (const lead of leads) {
      if (!lead.phone || !lead.created_at) continue;

      const createdTime = new Date(lead.created_at).getTime();
      const days = Math.floor(
        (now - createdTime) / (1000 * 60 * 60 * 24)
      );

      // =====================
      // DAY 1 FOLLOW-UP
      // =====================
      if (days >= 1 && lead.stage !== "day1") {
        await sendSMS(
          lead.phone,
          "RoofFlow update: spots in your area are filling quickly. Secure your onboarding today."
        );

        updates.push(
          supabase
            .from("leads")
            .update({ stage: "day1" })
            .eq("id", lead.id)
        );
      }

      // =====================
      // DAY 3 URGENCY
      // =====================
      if (days >= 3 && lead.stage !== "day3") {
        await sendSMS(
          lead.phone,
          "Final notice: your territory may close soon. Book here: https://calendly.com/yourlink"
        );

        updates.push(
          supabase
            .from("leads")
            .update({ stage: "day3" })
            .eq("id", lead.id)
        );
      }
    }

    // =====================
    // APPLY UPDATES SAFELY
    // =====================
    if (updates.length > 0) {
      await Promise.allSettled(updates);
    }

    return Response.json({
      ok: true,
      processed: leads.length,
      updated: updates.length,
    });
  } catch (err) {
    console.error("Drip system error:", err);

    return Response.json(
      {
        ok: false,
        error: "Drip automation failed",
      },
      { status: 500 }
    );
  }
}