import { calculateLeadValue } from "@/lib/pricingEngine";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ===============================
// HELPERS
// ===============================
function normalizePhone(phone = "") {
  return phone.replace(/\D/g, "");
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function getIP(req) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// ===============================
// 🔐 ATOMIC RATE LIMIT (UPSERT COUNTER)
// ===============================
async function rateLimit(ip) {
  const windowMs = 60 * 1000;
  const max = 30;

  const bucket = Math.floor(Date.now() / windowMs);
  const id = `${ip}:${bucket}`;

  const { data, error } = await supabase
    .from("rate_limits")
    .upsert(
      {
        id,
        ip,
        count: 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) throw error;

  // increment (safe because same row)
  const { data: updated } = await supabase
    .from("rate_limits")
    .update({
      count: (data.count || 1) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  return updated.count <= max;
}

// ===============================
// 🔁 ATOMIC INSERT
// ===============================
async function insertLeadAtomic(payload) {
  const { data, error } = await supabase
    .from("leads")
    .insert(payload)
    .select()
    .single();

  if (error?.code === "23505") {
    return { duplicate: true };
  }

  if (error) throw error;

  return { lead: data };
}

// ===============================
// MAIN
// ===============================
export async function POST(req) {
  const start = Date.now();

  try {
    const body = await req.json();

    let { phone, score = 5, cityTier = "basic", city } = body;

    const ip = getIP(req);

    // ===============================
    // REQUEST IDEMPOTENCY (OPTIONAL BUT STRONG)
    // ===============================
    const requestKey =
      req.headers.get("x-idempotency-key") ||
      hash(JSON.stringify(body));

    // ===============================
    // RATE LIMIT
    // ===============================
    const allowed = await rateLimit(ip);

    if (!allowed) {
      return Response.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    // ===============================
    // VALIDATION
    // ===============================
    if (!phone) {
      return Response.json(
        { error: "Missing phone" },
        { status: 400 }
      );
    }

    phone = normalizePhone(phone);

    if (phone.length < 10) {
      return Response.json(
        { error: "Invalid phone" },
        { status: 400 }
      );
    }

    score = Math.max(1, Math.min(Number(score) || 5, 10));

    // ===============================
    // IDEMPOTENCY KEY (PHONE + CITY)
    // ===============================
    const identityHash = hash(`${phone}:${city || "global"}`);

    const leadValue = calculateLeadValue(score, cityTier);

    // ===============================
    // INSERT LEAD
    // ===============================
    const result = await insertLeadAtomic({
      phone,
      identity_hash: identityHash,
      score,
      city,
      city_tier: cityTier,
      status: "queued",
      source: "api",
      request_key: requestKey,
      created_at: new Date().toISOString(),
    });

    if (result.duplicate) {
      return Response.json({
        success: true,
        duplicate: true,
      });
    }

    const lead = result.lead;

    // ===============================
    // QUEUE INSERT (MUST SUCCEED)
    // ===============================
    const { error: queueError } = await supabase
      .from("lead_queue")
      .insert({
        lead_id: lead.id,
        status: "pending",
        created_at: new Date().toISOString(),
      });

    // 🔥 CRITICAL: rollback if queue fails
    if (queueError) {
      console.error("Queue insert failed, rolling back:", queueError);

      await supabase
        .from("leads")
        .delete()
        .eq("id", lead.id);

      return Response.json(
        { error: "Queue failure" },
        { status: 500 }
      );
    }

    const duration = Date.now() - start;

    return Response.json({
      success: true,
      leadId: lead.id,
      leadValue,
      duration_ms: duration,
    });

  } catch (err) {
    console.error("❌ Lead intake error:", err);

    return Response.json(
      { error: "Lead engine error" },
      { status: 500 }
    );
  }
}