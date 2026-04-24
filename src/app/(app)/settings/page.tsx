import { requireWorkspace } from "@/server/services";
import { signOut } from "./actions";

export default async function SettingsPage() {
  const workspace = await requireWorkspace();

  return (
    <main className="max-w-screen-lg mx-auto p-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Owner settings. Phase 22 placeholder.
      </p>

      <dl className="mt-6 text-sm space-y-1">
        <div className="flex gap-2">
          <dt className="text-neutral-500 w-32">Workspace</dt>
          <dd className="font-medium">{workspace.name}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-neutral-500 w-32">Service day</dt>
          <dd className="font-medium">
            {workspace.service_day_mode === "nightlife"
              ? `nightlife (ends at ${workspace.nightlife_cutoff_hour}:00am)`
              : "standard (midnight cutoff)"}
          </dd>
        </div>
      </dl>

      <form action={signOut} className="mt-8">
        <button
          type="submit"
          className="rounded border border-neutral-300 py-2 px-4 text-sm hover:bg-neutral-100"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
