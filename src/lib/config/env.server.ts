import "server-only";
import { z } from "zod";

/**
 * Server-side environment configuration for AmIFree.
 *
 * Validated at module load. Throws with a clear message listing every
 * missing or invalid variable. Server-only — importing from a client
 * component will fail at build time via the "server-only" package.
 *
 * See docs/phases/22-canonical-beta-foundation.md §Environment and secrets
 * plan for the full spec.
 */
const serverEnvSchema = z.object({
  // --- App / runtime ---
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_ENV: z.enum(["local", "preview", "private_beta"]),
  APP_ALLOWED_EMAILS: z
    .string()
    .min(1, "APP_ALLOWED_EMAILS must list at least one owner email"),

  // --- Supabase (server) ---
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_PROJECT_ID: z.string().optional(),
  DATABASE_URL: z.string().min(1),

  // --- Supabase (browser-safe; also read server-side for SSR) ---
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // --- Graphile Worker ---
  GRAPHILE_WORKER_DATABASE_URL: z.string().optional(),
  GRAPHILE_WORKER_SCHEMA: z.string().default("graphile_worker"),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(5),

  // --- OpenAI ---
  // Optional in Phase 22 foundation; required once extraction flows ship.
  OPENAI_API_KEY: z.string().optional(),

  // --- Observability ---
  // Optional in local; required for preview and private-beta-production.
  ERROR_TRACKING_DSN: z.string().optional(),
  LOG_DRAIN_URL: z.string().optional(),
  DEPLOYMENT_LABEL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function parseServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid or missing environment variables. Copy .env.local.example to .env.local and fill in real values.\n${issues}`,
    );
  }
  return result.data;
}

export const serverEnv: ServerEnv = parseServerEnv();

/**
 * Parsed allowlist of owner emails, lowercased and trimmed.
 * Derived from APP_ALLOWED_EMAILS (comma-separated). Phase 22 is
 * owner-only: no public signup, no self-serve invites.
 */
export const allowedEmails: readonly string[] = serverEnv.APP_ALLOWED_EMAILS
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
