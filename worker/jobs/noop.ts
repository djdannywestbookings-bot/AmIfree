import type { Task } from "graphile-worker";

/**
 * Placeholder job. Proves that enqueue → runner wiring works end-to-end.
 * Accepts any JSON payload, logs it, resolves successfully.
 *
 * Real domain jobs (audit emissions, OpenAI extractions, notification
 * fanout) land in later phases. Keep this file for smoke-testing even
 * after real jobs exist.
 */
export const noop: Task = async (payload, helpers) => {
  helpers.logger.info(
    `noop job completed: ${JSON.stringify(payload ?? {})}`,
  );
};
