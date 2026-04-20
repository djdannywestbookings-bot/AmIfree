import { run } from "graphile-worker";
import { serverEnv } from "@/lib/config/env.server";
import { noop } from "../jobs/noop";

/**
 * Graphile Worker runtime for AmIFree.
 *
 * Separate long-running Node process per Phase 22 §Deploy/hosting plan.
 * Connects to the same Postgres database as the Next app but must use
 * a session-mode or direct connection — the Supabase Transaction pooler
 * (port 6543) does NOT proxy LISTEN/NOTIFY, which Graphile Worker uses
 * for job notifications. Set GRAPHILE_WORKER_DATABASE_URL to the
 * Session pooler URL (or direct connection) in .env.local.
 *
 * Graphile Worker installs its own `graphile_worker` schema on first
 * run via its internal migration; no manual SQL needed.
 */
async function main() {
  const connectionString =
    serverEnv.GRAPHILE_WORKER_DATABASE_URL ?? serverEnv.DATABASE_URL;

  const runner = await run({
    connectionString,
    concurrency: serverEnv.WORKER_CONCURRENCY,
    noHandleSignals: false,
    pollInterval: 1000,
    schema: serverEnv.GRAPHILE_WORKER_SCHEMA,
    taskList: {
      noop,
    },
  });

  console.log(
    `Graphile Worker started (schema=${serverEnv.GRAPHILE_WORKER_SCHEMA}, concurrency=${serverEnv.WORKER_CONCURRENCY})`,
  );

  await runner.promise;
}

main().catch((err) => {
  console.error("Worker failed:", err);
  process.exit(1);
});
