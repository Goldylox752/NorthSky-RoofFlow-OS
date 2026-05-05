import crypto from "crypto";
import { supabase } from "@/lib/supabase";

// ===============================
// 🧠 GLOBAL RISK STATE (DYNAMIC)
// ===============================
let GLOBAL_STATE = {
  baselineRisk: 0.55,
  sensitivity: 1.0,
  botSpikeDetected: false,
};

// ===============================
// 🔐 FINGERPRINT
// ===============================
export function fingerprint(req, body = {}) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const ua = req.headers.get("user-agent") || "";

  return crypto
    .createHash("sha256")
    .update(`${ip}|${ua}|${JSON.stringify(body)}`)
    .digest("hex");
}

// ===============================
// 📊 REAL-TIME TRAFFIC ANALYSIS
// ===============================
async function trafficContext() {
  const window = new Date(Date.now() - 1000 * 60 * 5).toISOString();

  const { data } = await supabase
    .from("request_logs")
    .select("risk, ip, created_at")
    .gte("created_at", window);

  const total = data?.length || 0;
  const highRisk = data?.filter((r) => r.risk > 0.7).length || 0;

  const botRatio = total ? highRisk / total : 0;

  return {
    total,
    botRatio,
  };
}

// ===============================
// 🧠 ADAPTIVE THRESHOLD ENGINE
// ===============================
async function updateGlobalState() {
  const ctx = await trafficContext();

  // 🚨 BOT SPIKE DETECTED
  if (ctx.botRatio > 0.25) {
    GLOBAL_STATE.botSpikeDetected = true;
    GLOBAL_STATE.sensitivity = 1.3; // harder rules
    GLOBAL_STATE.baselineRisk = 0.45;
  }

  // normal traffic
  else if (ctx.botRatio < 0.05) {
    GLOBAL_STATE.botSpikeDetected = false;
    GLOBAL_STATE.sensitivity = 1.0;
    GLOBAL_STATE.baselineRisk = 0.6;
  }

  // medium risk environment
  else {
    GLOBAL_STATE.sensitivity = 1.15;
    GLOBAL_STATE.baselineRisk = 0.55;
  }
}

// ===============================
// 📈 IP RISK (ADAPTIVE)
// ===============================
async function ipRisk(ip) {
  const window = new Date(Date.now() - 1000 * 60 * 10).toISOString();

  const { data } = await supabase
    .from("request_logs")
    .select("risk")
    .eq("ip", ip)
    .gte("created_at", window);

  const hits = data?.length || 0;

  let score = 0.1;

  if (hits > 80) score = 1.0;
  else if (hits > 40) score = 0.85;
  else if (hits > 20) score = 0.6;
  else if (hits > 10) score = 0.35;

  // 🔥 adapt based on system state
  return Math.min(1, score * GLOBAL_STATE.sensitivity);
}

// ===============================
// 🧠 BEHAVIOR ANALYSIS (IMPROVED)
// ===============================
function behaviorScore(body = {}) {
  let score = 0;

  if (!body.phone) score += 0.25;
  if (!body.email) score += 0.15;

  if (typeof body.message === "string") {
    if (body.message.length < 6) score += 0.2;
    if (/(.)\1{6,}/.test(body.message)) score += 0.3;
  }

  if (!body.city) score += 0.1;

  return Math.min(1, score);
}

// ===============================
// 🚨 SELF-LEARNING DECISION ENGINE
// ===============================
export async function adaptiveBotGuard(req, body = {}) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  // update system state BEFORE decision
  await updateGlobalState();

  // check global block list
  const blocked = await supabase
    .from("blocked_ips")
    .select("ip")
    .eq("ip", ip)
    .maybeSingle();

  if (blocked?.data) {
    return {
      allowed: false,
      reason: "hard_block",
      risk: 1,
    };
  }

  const ipScore = await ipRisk(ip);
  const behavior = behaviorScore(body);

  let risk = Math.min(1, ipScore + behavior);

  // 🔥 adaptive threshold
  const threshold = GLOBAL_STATE.baselineRisk;

  // 🚨 auto-learn: detect emerging bot patterns
  if (risk > 0.85) {
    await supabase.from("blocked_ips").insert({
      ip,
      reason: "auto_learning_bot_detection",
      risk_score: risk,
      created_at: new Date().toISOString(),
    });

    return {
      allowed: false,
      reason: "bot_farm_detected",
      risk,
    };
  }

  // soft block
  if (risk > threshold) {
    return {
      allowed: false,
      reason: "high_risk",
      risk,
    };
  }

  // ===============================
  // 📊 FEEDBACK LOOP (SELF-LEARNING)
  // ===============================
  supabase.from("request_logs").insert({
    ip,
    risk,
    bot_spike: GLOBAL_STATE.botSpikeDetected,
    created_at: new Date().toISOString(),
  }).catch(() => {});

  return {
    allowed: true,
    risk,
    threshold,
    sensitivity: GLOBAL_STATE.sensitivity,
  };
}