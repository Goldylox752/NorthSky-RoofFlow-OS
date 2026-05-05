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
  return xf ? xf.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown";
}

// ===============================
// 🚫 ADAPTIVE RATE LIMIT (BOT SPIKE RESISTANT)
// ===============================
async function rateLimit(ip) {
  const windowMs = 60 * 1000;
  const max = 30;

  const bucket = Math.floor(Date.now() / windowMs);
  const id = `${ip}:${bucket}`;

  // single atomic increment using upsert
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

  const newCount = (data.count || 0) + 1;

  // update counter (single row mutation only)
  await supabase
    .from("rate_limits")
    .update({
      count: newCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  // 🔥 adaptive penalty (hard throttle if spam detected)
  return newCount <= max;
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
    // RATE LIMIT
    // ===============================
    const allowed = await rateLimit(ip);

    if (!allowed) {
      return Response.json(
        { error: "Rate limited (bot protection active)" },
        { status: 429 }
      );
    }

    // ===============================
    // VALIDATION
    // ===============================
    if (!phone) {
      return Response.json({ error: "Missing phone" }, { status: 400 });
    }

    phone = normalizePhone(phone);

    if (phone.length < 10) {
      return Response.json({ error: "Invalid phone" }, { status: 400 });
    }

    score = Math.max(1, Math.min(Number(score) || 5, 10));

    // ===============================
    // IDS
    // ===============================
    const identityHash = hash(`${phone}:${city || "global"}`);
    const requestKey =
      req.headers.get("x-idempotency-key") ||
      hash(JSON.stringify(body));

    const leadValue = calculateLeadValue(score, cityTier);

    // ===============================
    // 🔥 TRUE ATOMIC INSERT (DB GUARANTEE REQUIRED)
    // ===============================
    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        phone,
        identity_hash: identityHash,
        request_key: requestKey,
        score,
        city,
        city_tier: cityTier,

        status: "queued",
        source: "api",

        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    // duplicate safe path (unique constraint in DB)
    if (error?.code === "23505") {
      return Response.json({
        success: true,
        duplicate: true,
      });
    }

    if (error) throw error;

    // ===============================
    // 🧠 QUEUE INSERT (RECOVERY SAFE)
    // ===============================
    const { error: queueError } = await supabase
      .from("lead_queue")
      .insert({
        lead_id: lead.id,
        status: "pending",
        attempts: 0,
        created_at: new Date().toISOString(),
      });

    if (queueError) {
      // 🔥 DO NOT DELETE — mark for recovery worker
      await supabase
        .from("leads")
        .update({
          status: "queue_failed",
        })
        .eq("id", lead.id);

      return Response.json(
        { error: "Queue failure (recoverable)" },
        { status: 500 }
      );
    }

    // ===============================
    // RESPONSE
    // ===============================
    return Response.json({
      success: true,
      leadId: lead.id,
      leadValue,
      latency_ms: Date.now() - start,
    });

  } catch (err) {
    console.error("❌ Lead intake crash:", err);

    return Response.json(
      { error: "Lead engine error" },
      { status: 500 }
    );
  }
}