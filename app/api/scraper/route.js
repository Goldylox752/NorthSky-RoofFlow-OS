import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") || "unknown";

    const limit = await rateLimit(ip);

    if (!limit.success) {
      return Response.json({ ok: false, error: "rate limited" }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body?.leadId) {
      return Response.json({ ok: false, error: "missing leadId" }, { status: 400 });
    }

    // push to queue instead of processing immediately
    const { error } = await supabaseAdmin
      .from("lead_queue")
      .insert({
        lead_id: body.leadId,
        status: "queued",
      });

    if (error) {
      return Response.json({ ok: false, error: "queue failed" }, { status: 500 });
    }

    return Response.json({
      ok: true,
      queued: true,
    });

  } catch (err) {
    return Response.json(
      { ok: false, error: "server error" },
      { status: 500 }
    );
  }
}