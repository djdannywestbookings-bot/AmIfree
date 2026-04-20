import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/config/env.public";

/**
 * Supabase client for use in Client Components and other browser contexts.
 *
 * Uses the anon key and the browser's cookie store for session state.
 * Never pass sensitive queries through this client — RLS is the only
 * authorization surface it sees.
 */
export function createClient() {
  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
