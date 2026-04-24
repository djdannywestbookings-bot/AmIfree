import { requireWorkspace } from "@/server/services";

export default async function AgendaPage() {
  const workspace = await requireWorkspace();

  return (
    <main className="max-w-screen-lg mx-auto p-8">
      <h1 className="text-2xl font-semibold">Agenda</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Bookings view. Agenda is Bookings-only; coverage of recurring shifts
        lives under Coverage. Phase 22 placeholder.
      </p>
      <p className="mt-4 text-xs text-neutral-500">
        Workspace: <strong>{workspace.name}</strong> ·{" "}
        {workspace.service_day_mode === "nightlife"
          ? `nightlife day (ends at ${workspace.nightlife_cutoff_hour}:00am)`
          : "standard day"}
      </p>
    </main>
  );
}
