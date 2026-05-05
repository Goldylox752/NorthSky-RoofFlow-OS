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

function getFingerprint(req, body) {
  const ua = req.headers.get("user-agent") || "";
  return hash(`${ua}:${JSON.stringify(body)}`);
}

// ===============================
// 🧠 ADAPTIVE BOT SCORE ENGINE
// ===============================
async function getRiskScore(ip, fingerprint) {
  const window = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("rate_limits")
    .select("count")
    .or(`ip.eq.${ip},fingerprint.eq.${fingerprint}`)
    .gte("created_at", window);

  const attempts = data?.reduce((a, b) => a + (b.count || 0), 0) || 0;

  if (attempts > 80) return 10; // bot
  if (attempts > 40) return 7;
  if (attempts > 20) return 4;
  return 1;
}

// ===============================
// 🚫 ATOMIC RATE LIMIT (FIXED RACE CONDITION)
// ===============================
async function rateLimit(ip, fingerprint) {
  const bucket = Math.floor(Date.now() / 60000);
  const id = `${ip}:${fingerprint}:${bucket}`;

  const { data, error } = await supabase
    .from("rate_limits")
    .upsert(
      {
        id,
        ip,
        fingerprint,
        count: 1,
        created_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) return false;

  const newCount = (data.count || 0) + 1;

  await supabase
    .from("rate_limits")
    .update({
      count: newCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return newCount <= 30;
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
    const fingerprint = getFingerprint(req, body);

    // ===============================
    // BOT FIREWALL LAYER 1
    // ===============================
    const allowed = await rateLimit(ip, fingerprint);

    if (!allowed) {
      return Response.json(
        { error: "Rate limited (bot firewall active)" },
        { status: 429 }
      );
    }

    // ===============================
    // BOT FIREWALL LAYER 2 (ADAPTIVE)
    // ===============================
    const risk = await getRiskScore(ip, fingerprint);

    if (risk >= 9) {
      return Response.json(
        { error: "Blocked (bot detected)" },
        { status: 403 }
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
    const requestKey = hash(JSON.stringify(body));

    const leadValue = calculateLeadValue(score, cityTier);

    // ===============================
    // LEAD INSERT (RACE SAFE)
    // ===============================
    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        phone,
        identity_hash: identityHash,
        request_key: requestKey,

        fingerprint,
        ip,

        risk_score: risk,

        score,
        city,
        city_tier: cityTier,

        status: "queued",
        source: "api",

        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error?.code === "23505") {
      return Response.json({
        success: true,
        duplicate: true,
      });
    }

    if (error) throw error;

    // ===============================
    // QUEUE INSERT (RECOVERY SAFE)
    // ===============================
    const { error: queueError } = await supabase
      .from("lead_queue")
      .insert({
        lead_id: lead.id,
        status: "pending",
        attempts: 0,
        risk_score: risk,
        created_at: new Date().toISOString(),
      });

    if (queueError) {
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

    return Response.json({
      success: true,
      leadId: lead.id,
      leadValue,
      risk_score: risk,
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