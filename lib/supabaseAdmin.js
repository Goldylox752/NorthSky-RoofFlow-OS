import { createClient } from "@supabase/supabase-js";

// server-only Supabase client
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
