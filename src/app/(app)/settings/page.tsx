import { headers } from "next/headers";
import { requireWorkspace } from "@/server/services";
import { signOut } from "./actions";
import { CalendarSyncSection } from "./_components/CalendarSyncSection";

export default async function SettingsPage() {
  const workspace = await requireWorkspace();

  // Build the absolute base URL from the request so the iCal URL
  // works in dev (localhost), preview, and production.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "am-ifree.vercel.app";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const baseUrl = `${proto}://${host}`;

  return (
    <main className="max-w-screen-md mx-auto p-4 sm:p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="border border-neutral-200 rounded-md p-5 bg-white space-y-3">
        <h2 className="text-lg font-semibold text-indigo-700">Workspace</h2>
        <dl className="text-sm space-y-1">
          <div className="flex gap-2">
            <dt className="text-neutral-500 w-32">Name</dt>
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
      </section>

      <CalendarSyncSection
        initialToken={workspace.calendar_token}
        baseUrl={baseUrl}
      />

      <section className="border border-neutral-200 rounded-md p-5 bg-white">
        <h2 className="text-lg font-semibold text-indigo-700 mb-3">Account</h2>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded border border-neutral-300 py-2 px-4 text-sm hover:bg-neutral-100"
          >
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
