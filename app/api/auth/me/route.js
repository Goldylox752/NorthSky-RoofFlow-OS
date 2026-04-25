import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = getSupabaseServer();

    if (!supabase) {
      return Response.json(
        { error: "Supabase server not configured" },
        { status: 500 }
      );
    }

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return Response.json({
      user: data?.user ?? null
    });
  } catch (err) {
    return Response.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
