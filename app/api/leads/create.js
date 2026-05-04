import { supabase } from "@/lib/supabase";

// ===============================
// HELPERS (SAFE IDS / KEYS)
// ===============================
function buildDedupeKey(email, phone, city) {
  const identity = email || phone;
  return `${identity}:${city?.toLowerCase().trim() || "global"}`;
}

// ===============================
// CREATE + ROUTE LEAD (HARDENED)
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
        { error: "Email or phone required" },
        { status: 400 }
      );
    }

    const dedupeKey = buildDedupeKey(email, phone, city);

    // =====================================================
    // 1. IDEMPOTENCY CHECK (FAST PATH - PREVENT DUPLICATES)
    // =====================================================
    const { data: existing } = await supabase
      .from("leads")
      .select("id, status, assigned_contractor_id, price")
      .eq("dedupe_key", dedupeKey)
      .maybeSingle();

    if (existing) {
      return Response.json({
        success: true,
        duplicate: true,
        lead: existing,
      });
    }

    // ===============================
    // 2. SCORING ENGINE (DETERMINISTIC)
    // ===============================
    let score = 5;
    if (email) score += 1;
    if (phone) score += 2;
    if (city) score += 1;
    score = Math.min(score, 10);

    // =====================================================
    // 3. CREATE LEAD (SOURCE OF TRUTH INSERT)
    // =====================================================
    const { data: lead, error: createError } = await supabase
      .from("leads")
      .insert({
        email,
        phone,
        name,
        city: city || null,
        source: source || "direct",

        dedupe_key: dedupeKey,

        score,
        status: "new",

        price: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError || !lead) {
      return Response.json(
        { error: "Lead creation failed" },
        { status: 500 }
      );
    }

    // =====================================================
    // 4. ROUTING ENGINE (EXTERNAL DECISION SYSTEM)
    // =====================================================
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

    // =====================================================
    // 5. ATOMIC CLAIM (RACE CONDITION PROTECTION)
    // =====================================================
    const { data: updatedLead, error: updateError } = await supabase
      .from("leads")
      .update({
        status: "assigned",
        assigned_contractor_id: assignment.contractorId,

        lock_owner: assignment.contractorId,
        locked_at: new Date().toISOString(),

        price: calculatePrice(score, assignment.cityTier || "basic"),
      })
      .eq("id", lead.id)
      .eq("status", "new") // CRITICAL RACE GUARD
      .select()
      .single();

    if (updateError || !updatedLead) {
      return Response.json(
        {
          error: "LEAD_ALREADY_CLAIMED",
        },
        { status: 409 }
      );
    }

    // =====================================================
    // 6. EVENT LOG (AUDIT TRAIL)
    // =====================================================
    await supabase.from("events").insert({
      lead_id: lead.id,
      type: "assigned",
      payload: {
        contractorId: assignment.contractorId,
        price: updatedLead.price,
        city: assignment.city,
      },
      created_at: new Date().toISOString(),
    });

    // =====================================================
    // RESPONSE
    // =====================================================
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

  } catch (err) {
    console.error("🔥 Lead engine crash:", err);

    return Response.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}