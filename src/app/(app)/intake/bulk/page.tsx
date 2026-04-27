import Link from "next/link";
import { requireWorkspace } from "@/server/services";
import { serverEnv } from "@/lib/config/env.server";
import { BulkIntakeForm } from "../_components/BulkIntakeForm";

export default async function BulkIntakePage() {
  const workspace = await requireWorkspace();
  const hasOpenAI = Boolean(serverEnv.OPENAI_API_KEY);

  return (
    <main className="max-w-screen-lg mx-auto p-4 sm:p-8 space-y-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Bulk import</h1>
        <Link
          href="/intake"
          className="text-xs text-neutral-500 underline hover:text-neutral-700"
        >
          ← single booking intake
        </Link>
      </div>

      <p className="text-xs text-neutral-500">
        <strong>{workspace.name}</strong> ·{" "}
        {hasOpenAI
          ? "AI extraction (multi-row)"
          : "heuristic extraction (no API key)"}
      </p>

      <p className="text-sm text-neutral-600 max-w-2xl">
        Paste a table from a spreadsheet (tab-separated), a numbered list, or
        any text containing multiple bookings. AmIFree pulls each row into a
        draft, you review, and we save them all in one go.
      </p>

      <BulkIntakeForm />
    </main>
  );
}
