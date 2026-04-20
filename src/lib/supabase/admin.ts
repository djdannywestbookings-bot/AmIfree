import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/config/env.public";
import { serverEnv } from "@/lib/config/env.server";

/**
 * Service-role Supabase client. Bypasses RLS entirely.
 *
 * Restricted to server/admin paths only. Never expose through a public
 * route handler without a server-side policy check gating access. Phase
 * 22 §Data access and backend wiring: "service-role access restricted
 * to server/admin paths only."
 *
 * Sessions are disabled because this client acts as the service, not
 * on behalf of a user.
 */
export function createAdminClient() {
  return createSupabaseClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
