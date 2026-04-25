import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  return Response.json({ user: data.user });
}
