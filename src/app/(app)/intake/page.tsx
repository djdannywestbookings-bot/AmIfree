import Link from "next/link";
import { requireWorkspace } from "@/server/services";
import { serverEnv } from "@/lib/config/env.server";
import { IntakeForm } from "./_components/IntakeForm";

export default async function IntakePage() {
  const workspace = await requireWorkspace();
  const hasOpenAI = Boolean(serverEnv.OPENAI_API_KEY);

  return (
    <main className="max-w-screen-lg mx-auto p-4 sm:p-8 space-y-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Intake</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/intake/bulk"
            className="text-xs rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-50"
          >
            Bulk import →
          </Link>
          <p className="text-xs text-neutral-500">
            <strong>{workspace.name}</strong> ·{" "}
            {hasOpenAI
              ? "AI extraction"
              : "heuristic extraction (no API key yet)"}
          </p>
        </div>
      </div>

      <p className="text-sm text-neutral-600 max-w-2xl">
        Paste a booking inquiry — a text message, email, or invoice. AmIFree
        will pull out what it can, hand you a draft to review, and save it to
        your agenda once you confirm. For multiple bookings at once, use{" "}
        <Link href="/intake/bulk" className="underline">
          bulk import
        </Link>
        .
      </p>

      <IntakeForm />
    </main>
  );
}
