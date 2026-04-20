import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/config/env.server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Health check endpoint per Phase 22 §Data access and backend wiring.
 *
 * Returns booleans for:
 *   - app: process reached the handler
 *   - auth: required Supabase auth configuration values present
 *   - worker: worker connection string present (Graphile Worker config)
 *   - database: service-role client can reach the database
 *
 * Returns HTTP 200 when all checks pass; 503 otherwise.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    app: true,
    auth: Boolean(
      serverEnv.NEXT_PUBLIC_SUPABASE_URL &&
        serverEnv.SUPABASE_SERVICE_ROLE_KEY &&
        serverEnv.APP_ALLOWED_EMAILS,
    ),
    worker: Boolean(
      serverEnv.GRAPHILE_WORKER_DATABASE_URL ?? serverEnv.DATABASE_URL,
    ),
    database: false,
  };

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.listUsers({ perPage: 1 });
    checks.database = !error;
  } catch {
    checks.database = false;
  }

  const ok = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      ok,
      env: serverEnv.APP_ENV,
      checks,
    },
    { status: ok ? 200 : 503 },
  );
}
