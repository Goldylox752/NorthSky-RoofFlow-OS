import { createClient } from "@supabase/supabase-js";
import { assignLead } from "../../engine/assignLead";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      phone,
      city,
      org_id,
      source = "web"
    } = req.body;

    // =========================
    // 1. VALIDATION
    // =========================
    if (!name || !phone || !org_id) {
      return res.status(400).json({
        error: "Missing required fields (name, phone, org_id)"
      });
    }

    // =========================
    // 2. DUPLICATE CHECK (anti spam)
    // =========================
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("phone", phone)
      .eq("org_id", org_id)
      .maybeSingle();

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Lead already exists",
        lead_id: existing.id
      });
    }

    // =========================
    // 3. CREATE LEAD
    // =========================
    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        name,
        phone,
        city,
        org_id,
        source,
        status: "new",
        score: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Lead insert error:", error);
      return res.status(500).json({ error: "Failed to create lead" });
    }

    // =========================
    // 4. ASSIGN LEAD (CORE ENGINE)
    // =========================
    let agent = null;

    try {
      agent = await assignLead(lead);
    } catch (err) {
      console.error("Assignment failed:", err);
    }

    // =========================
    // 5. REALTIME PUSH (dashboard update)
    // =========================
    await supabase.channel("queue_updates").send({
      type: "broadcast",
      event: "lead_assigned",
      payload: {
        lead,
        agent
      }
    });

    // =========================
    // 6. RESPONSE
    // =========================
    return res.status(200).json({
      success: true,
      lead,
      assigned_to: agent?.name || null
    });

  } catch (err) {
    console.error("Fatal lead create error:", err);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}