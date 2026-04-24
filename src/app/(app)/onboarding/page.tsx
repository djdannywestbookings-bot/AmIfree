"use client";

import { useState, type FormEvent } from "react";
import { createWorkspaceAction } from "./actions";

/**
 * First-run onboarding. Shown after sign-in when the user has no
 * workspace membership yet. Captures the workspace name and picks the
 * service_day_mode that all future bookings will anchor against.
 *
 * Phase 24B. Runs inside the (app) route group so middleware requires a
 * signed-in session; the (app) layout shows its nav around this page
 * but that's cosmetic — once the workspace exists the user lands on
 * /agenda and the app is live.
 */
export default function OnboardingPage() {
  const [serviceDayMode, setServiceDayMode] = useState<"standard" | "nightlife">(
    "standard",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const result = await createWorkspaceAction(form);

    // On success, the action redirects and this line never runs.
    setPending(false);
    if (result && !result.ok) {
      setError(result.error);
    }
  }

  return (
    <main className="min-h-[calc(100dvh-57px)] flex items-start justify-center px-4 py-8 sm:py-16">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold">Set up your workspace</h1>
        <p className="text-sm text-neutral-600 mt-2 mb-6">
          Pick a name and how your day ends. You can change either later.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="block text-sm font-medium mb-1">
              Workspace name
            </span>
            <input
              type="text"
              name="name"
              required
              autoFocus
              maxLength={120}
              placeholder="Bottle Blonde, Studio West, Your name"
              className="w-full rounded border border-neutral-300 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <span className="block text-xs text-neutral-500 mt-1">
              Usually a business, studio, venue, or your own name.
            </span>
          </label>

          <fieldset className="space-y-3">
            <legend className="block text-sm font-medium mb-1">
              When does your day end?
            </legend>

            <label className="flex items-start gap-3 rounded border border-neutral-300 p-3 cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="service_day_mode"
                value="standard"
                checked={serviceDayMode === "standard"}
                onChange={() => setServiceDayMode("standard")}
                className="mt-0.5"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium">Standard day</span>
                <span className="block text-xs text-neutral-500 mt-0.5">
                  Midnight ends the day. Good for daytime services —
                  photography, fitness, tutoring, appointments.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded border border-neutral-300 p-3 cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="service_day_mode"
                value="nightlife"
                checked={serviceDayMode === "nightlife"}
                onChange={() => setServiceDayMode("nightlife")}
                className="mt-0.5"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium">Nightlife day</span>
                <span className="block text-xs text-neutral-500 mt-0.5">
                  Day rolls over later — a Saturday 10pm–2am gig counts as
                  Saturday, not Sunday. Good for DJs, venues, late-night
                  entertainment.
                </span>
              </span>
            </label>
          </fieldset>

          {serviceDayMode === "nightlife" && (
            <label className="block">
              <span className="block text-sm font-medium mb-1">
                Nightlife day ends at
              </span>
              <select
                name="nightlife_cutoff_hour"
                defaultValue={6}
                className="w-full rounded border border-neutral-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {Array.from({ length: 13 }, (_, i) => i).map((h) => (
                  <option key={h} value={h}>
                    {h === 0 ? "Midnight (12am)" : `${h}:00am`}
                  </option>
                ))}
              </select>
              <span className="block text-xs text-neutral-500 mt-1">
                Anything before this hour anchors to the previous day.
                Default is 6am — the typical nightlife cutoff.
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-neutral-900 text-white py-2 disabled:opacity-50"
          >
            {pending ? "Creating workspace…" : "Create workspace and continue"}
          </button>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
