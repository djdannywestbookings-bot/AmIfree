import "server-only";

import { quickAddJob } from "graphile-worker";
import { serverEnv } from "@/lib/config/env.server";

/**
 * Enqueue a job for the Graphile Worker runtime to execute.
 *
 * Server-only — the database connection string must never leak to
 * the browser. Next bundling enforces this via the "server-only" marker.
 *
 * Later phases add domain-triggered jobs (audit emissions, OpenAI
 * extractions, notification fanout) on top of this adapter without
 * re-touching infrastructure.
 */
export async function enqueueJob<TPayload>(
  taskName: string,
  payload?: TPayload,
) {
  const connectionString =
    serverEnv.GRAPHILE_WORKER_DATABASE_URL ?? serverEnv.DATABASE_URL;

  return quickAddJob(
    { connectionString },
    taskName,
    payload,
  );
}
