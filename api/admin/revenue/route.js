import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabase.from("leads").select("price, status");

  const revenue = (data || []).reduce(
    (sum, l) => sum + (l.price || 0),
    0
  );

  const billed = (data || []).filter((l) => l.status === "assigned").length;

  return Response.json({
    revenue,
    leads: data?.length || 0,
    billed,
  });
}