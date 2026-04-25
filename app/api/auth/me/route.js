import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  return Response.json({ user: data.user });
}
