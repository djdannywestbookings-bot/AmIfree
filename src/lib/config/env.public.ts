import { z } from "zod";

/**
 * Browser-safe environment configuration for AmIFree.
 *
 * Only NEXT_PUBLIC_* values. Safe to import from server and client
 * components. Server-only configuration lives in env.server.ts.
 *
 * Next.js inlines NEXT_PUBLIC_* values at build time only when referenced
 * as literal property accesses. This module reads each key explicitly
 * rather than passing process.env wholesale, so the inliner can see them.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

function parsePublicEnv(): PublicEnv {
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid or missing NEXT_PUBLIC_* environment variables. See .env.local.example.\n${issues}`,
    );
  }
  return result.data;
}

export const publicEnv: PublicEnv = parsePublicEnv();
