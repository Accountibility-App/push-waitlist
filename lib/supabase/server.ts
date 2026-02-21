import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;

/** Server-only Supabase client (service role). Never expose to client. Throws when env is missing at first use. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    _admin = createClient(url, key, { auth: { persistSession: false } });
  }
  return _admin;
}

/** Use getSupabaseAdmin() in API routes so env is only required at runtime, not at build. */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseAdmin() as unknown as Record<string, unknown>)[prop as string];
  },
});
