import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

// ===============================
// 🧼 VALIDATION
// ===============================
function validateJobInput({ lead_id, assigned_to }) {
  if (!lead_id || !assigned_to) {
    return "Missing lead_id or assigned_to";
  }
  return null;
}

// ===============================
// 🔐 IDEMPOTENCY KEY
// prevents duplicate job creation per lead
// ===============================
function buildJobKey(lead_id, assigned_to) {
  return `job:${lead_id}:${assigned_to}`;
}

// ===============================
// CREATE JOB (HARDENED)
// ===============================
export async function POST(req) {
  try {
    const body = await req.json();

    const { lead_id, assigned_to, status = "pending" } = body;

    // ===============================
    // VALIDATION
    // ===============================
    const errorMsg = validateJobInput(body);
    if (errorMsg) {
      return Response.json({ error: errorMsg }, { status: 400 });
    }

    // ===============================
    // IDEMPOTENCY CHECK
    // ===============================
    const jobKey = buildJobKey(lead_id, assigned_to);

    const { data: existing } = await supabase
      .from("jobs")
      .select("id, lead_id, assigned_to, status")
      .eq("idempotency_key", jobKey)
      .maybeSingle();

    if (existing) {
      return Response.json({
        success: true,
        duplicate: true,
        job: existing,
      });
    }

    // ===============================
    // INSERT JOB
    // ===============================
    const { data, error } = await supabase
      .from("jobs")
      .insert([
        {
          lead_id,
          assigned_to,
          status,
          idempotency_key: jobKey,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      job: data,
    });

  } catch (err) {
    console.error("Job create error:", err);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ===============================
// GET JOBS (PAGINATED + SAFE)
// ===============================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50"),
      100
    );

    const offset = parseInt(searchParams.get("offset") || "0");

    const status = searchParams.get("status");

    let query = supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      jobs: data || [],
      pagination: {
        limit,
        offset,
      },
    });

  } catch (err) {
    console.error("Job fetch error:", err);

    return Response.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}