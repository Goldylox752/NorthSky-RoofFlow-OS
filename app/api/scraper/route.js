import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);

    const phone = body?.phone?.trim();

    if (!phone) {
      return Response.json(
        { ok: false, error: "Missing phone" },
        { status: 400 }
      );
    }

    const leadData = {
      phone,
      name: body?.name || null,
      city: body?.city || null,
      source: body?.source || "scraper",
      status: "active",
      stage: "new",
      created_at: new Date().toISOString(),
    };

    // =====================
    // INSERT (RELY ON DB UNIQUE CONSTRAINT)
    // =====================
    const { data: lead, error: insertError } = await supabaseAdmin
      .from("leads")
      .insert([leadData])
      .select()
      .single();

    if (insertError) {
      // handle duplicate safely
      if (insertError.code === "23505") {
        return Response.json({
          ok: true,
          duplicate: true,
        });
      }

      console.error("Insert error:", insertError);

      return Response.json(
        { ok: false, error: "Insert failed" },
        { status: 500 }
      );
    }

    // =====================
    // QUEUE (NON-BLOCKING BUT LOGGED)
    // =====================
    const { error: queueError } = await supabaseAdmin
      .from("lead_queue")
      .insert([
        {
          lead_id: lead.id,
          status: "queued",
        },
      ]);

    if (queueError) {
      console.error("Queue error:", queueError);
    }

    return Response.json({
      ok: true,
      lead,
    });
  } catch (err) {
    console.error("Ingest crash:", err);

    return Response.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}