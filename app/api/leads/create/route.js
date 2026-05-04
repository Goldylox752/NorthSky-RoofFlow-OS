import { supabase } from "@/lib/supabase";

// ===============================
// CREATE + ROUTE LEAD (SUPABASE SAAS ENGINE)
// ===============================
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, phone, name, city, source } = body;

    // ===============================
    // VALIDATION
    // ===============================
    if (!email && !phone) {
      return Response.json(
        { success: false, error: "Email or phone required" },
        { status: 400 }
      );
    }

    const identity = email || phone;
    const normalizedCity = city?.toLowerCase().trim() || "global";

    // ===============================
    // IDEMPOTENCY KEY (NO DUPLICATES)
    // ===============================
    const dedupeKey = `${identity}-${normalizedCity}`;

    const { data: existing } = await supabase
      .from("leads")
      .select("*")
      .eq("dedupe_key", dedupeKey)
      .maybeSingle();

    if (existing) {
      return Response.json({
        success: true,
        lead: existing,
        duplicate: true,
      });
    }

    // ===============================
    // SCORING ENGINE
    // ===============================
    let score = 5;
    if (email) score += 1;
    if (phone) score += 2;
    if (city) score += 1;
    score = Math.min(score, 10);

    // ===============================
    // CREATE LEAD (SOURCE OF TRUTH)
    // ===============================
    const { data: lead, error: createError } = await supabase
      .from("leads")
      .insert({
        email,
        phone,
        name,
        city,
        source: source || "direct",

        dedupe_key: dedupeKey,

        score,
        status: "new",

        price: 0,
      })
      .select()
      .single();

    if (createError) {
      return Response.json(
        { success: false, error: createError.message },
        { status: 500 }
      );
    }

    // ===============================
    // ROUTING ENGINE (EXTERNAL LOGIC)
    // ===============================
    const assignment = await routeLead(lead);

    if (!assignment?.contractorId) {
      await supabase.from("events").insert({
        lead_id: lead.id,
        type: "unassigned",
        payload: {
          reason: "no_contractor_available",
        },
      });

      return Response.json({
        success: true,
        routed: false,
        lead,
      });
    }

    // ===============================
    // ATOMIC CLAIM (RACE SAFE UPDATE)
    // ===============================
    const { data: updatedLead, error: updateError } = await supabase
      .from("leads")
      .update({
        status: "assigned",
        assigned_contractor_id: assignment.contractorId,
        lock_owner: assignment.contractorId,
        locked_at: new Date().toISOString(),
        price: calculatePrice(score, assignment.cityTier),
      })
      .eq("id", lead.id)
      .eq("status", "new")
      .select()
      .single();

    if (updateError || !updatedLead) {
      return Response.json(
        {
          success: false,
          error: "Race condition: lead already claimed",
        },
        { status: 409 }
      );
    }

    // ===============================
    // EVENT LOG (AUDIT TRAIL)
    // ===============================
    await supabase.from("events").insert({
      lead_id: lead.id,
      type: "assigned",
      payload: {
        contractorId: assignment.contractorId,
        price: updatedLead.price,
        city: assignment.city,
      },
    });

    // ===============================
    // RESPONSE
    // ===============================
    return Response.json({
      success: true,
      routed: true,
      lead: updatedLead,
      assignment: {
        contractorId: assignment.contractorId,
        price: updatedLead.price,
        city: assignment.city,
      },
    });

  } catch (error) {
    console.error("🔥 Lead crash:", error);

    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}