import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

// ===============================
// USER AUTH CLIENT
// ===============================
function getUserClient(req) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: req.headers.get("authorization") || "",
        },
      },
    }
  );
}

// ===============================
// BASIC IP RATE LIMIT (LIGHTWEIGHT)
// ===============================
const ipHits = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const windowMs = 10 * 1000; // 10 sec
  const maxHits = 20;

  const record = ipHits.get(ip) || { count: 0, start: now };

  if (now - record.start > windowMs) {
    record.count = 0;
    record.start = now;
  }

  record.count += 1;
  ipHits.set(ip, record);

  return record.count <= maxHits;
}

// ===============================
// GET LEADS (HARDENED)
// ===============================
export async function GET(req) {
  try {
    // ===============================
    // RATE LIMIT (IP LEVEL)
    // ===============================
    const ip =
      req.headers.get("x-forwarded-for") ||
      "unknown";

    if (!rateLimit(ip)) {
      return Response.json(
        { error: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const userClient = getUserClient(req);

    // ===============================
    // AUTH CHECK
    // ===============================
    const {
      data: { user },
    } = await userClient.auth.getUser();

    if (!user) {
      return Response.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // ===============================
    // GET ROLE (minimal projection)
    // ===============================
    const { data: profile } = await supabase
      .from("contractors")
      .select("id, role, city")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return Response.json(
        { error: "PROFILE_NOT_FOUND" },
        { status: 403 }
      );
    }

    const role = profile.role;

    // ===============================
    // PAGINATION SAFETY
    // ===============================
    const { searchParams } = new URL(req.url);

    const limit = Math.min(
      parseInt(searchParams.get("limit") || "25"),
      50 // hard cap for safety
    );

    const offset = Math.max(
      parseInt(searchParams.get("offset") || "0"),
      0
    );

    const contractorId = searchParams.get("contractorId");

    // ===============================
    // SAFE BASE QUERY (NO WILDCARD SELECT)
    // ===============================
    let query = supabase
      .from("leads")
      .select(
        `
        id,
        city,
        status,
        score,
        price_cents,
        assigned_contractor_id,
        created_at
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // ===============================
    // TENANT ENFORCEMENT (CRITICAL)
    // ===============================

    if (role === "contractor") {
      // force isolation — ignore query params
      query = query.eq(
        "assigned_contractor_id",
        profile.id
      );
    }

    if (role === "admin") {
      // admin can filter safely
      if (contractorId) {
        query = query.eq(
          "assigned_contractor_id",
          contractorId
        );
      }
    }

    // ===============================
    // EXECUTE
    // ===============================
    const { data, error } = await query;

    if (error) {
      return Response.json(
        { error: "QUERY_FAILED" },
        { status: 500 }
      );
    }

    // ===============================
    // RESPONSE
    // ===============================
    return Response.json({
      leads: data || [],
      meta: {
        limit,
        offset,
        role,
      },
    });

  } catch (err) {
    console.error("GET leads error:", err);

    return Response.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}