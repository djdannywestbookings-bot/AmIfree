"use client";

import { useEffect } from "react";

/**
 * Shell-level error boundary for (app)/* routes. Later phases wire this to
 * the observability pipeline; for now it logs to the console and offers
 * a retry.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: forward to ERROR_TRACKING_DSN once observability lands.
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-screen-lg mx-auto p-8">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-neutral-600">
        The shell hit an unexpected error. Retry to reload this view.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 text-sm transition-colors"
      >
        Retry
      </button>
    </main>
  );
}
