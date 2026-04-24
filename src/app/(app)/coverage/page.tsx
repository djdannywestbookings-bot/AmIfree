import { requireWorkspace } from "@/server/services";

export default async function CoveragePage() {
  await requireWorkspace();

  return (
    <main className="max-w-screen-lg mx-auto p-8">
      <h1 className="text-2xl font-semibold">Coverage</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Shift occurrences view. Coverage is Shift Occurrences-only; Bookings
        stay in Agenda. Phase 22 placeholder.
      </p>
    </main>
  );
}
