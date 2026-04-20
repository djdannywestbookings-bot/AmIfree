import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/config/env.public";

/**
 * Supabase client for use in Server Components, Route Handlers, and
 * Server Actions.
 *
 * Uses the anon key plus the session cookie from Next's request scope,
 * so calls are executed as the signed-in user with RLS enforced.
 *
 * Note on cookie writes: setAll may throw when called from a read-only
 * Server Component context. We swallow that error because session
 * refresh cookies will be written by middleware on the next request.
 * Phase 22 slice 7 (middleware) is what makes this safe.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component; ignore — middleware handles refresh.
          }
        },
      },
    },
  );
}
