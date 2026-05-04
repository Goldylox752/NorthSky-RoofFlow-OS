import { supabase } from "@/lib/supabase";

export async function POST(req) {
  const { leadId, status } = await req.json();

  const { data } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId)
    .select()
    .single();

  return Response.json({ success: true, lead: data });
}