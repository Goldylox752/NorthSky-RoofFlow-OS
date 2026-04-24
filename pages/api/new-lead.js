import { createClient } from "@supabase/supabase-js";
import { assignLead } from "../../lib/assignEngine";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const { name, phone, city } = req.body;

  const { data: lead } = await supabase
    .from("leads")
    .insert([{ name, phone, city }])
    .select()
    .single();

  const assigned = await assignLead(lead);

  res.json({ success: true, lead, assigned });
}