import { requireWorkspace } from "@/server/services";
import { serverEnv } from "@/lib/config/env.server";
import { BulkIntakeForm } from "./_components/BulkIntakeForm";

export default async function IntakePage() {
  const workspace = await requireWorkspace();
  const hasOpenAI = Boolean(serverEnv.OPENAI_API_KEY);

  return (
    <main className="max-w-screen-lg mx-auto p-4 sm:p-8 space-y-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Intake</h1>
        <p className="text-xs text-neutral-500">
          <strong>{workspace.name}</strong> ·{" "}
          {hasOpenAI
            ? "AI extraction"
            : "heuristic extraction (no API key yet)"}
        </p>
      </div>

      <p className="text-sm text-neutral-600 max-w-2xl">
        Paste a text message, email, or table — or drop in screenshots and
        spreadsheets. AmIFree pulls each booking into a draft for you to
        review, then saves them all in one go.
      </p>

      <BulkIntakeForm />
    </main>
  );
}
