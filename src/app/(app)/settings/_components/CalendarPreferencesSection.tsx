"use client";

import { useState, type FormEvent } from "react";
import { updateDefaultCalendarViewAction } from "../calendar-prefs-actions";

type ViewMode = 1 | 3 | 6 | 12;

/**
 * CalendarPreferencesSection — sets the user's default /calendar view.
 *
 * Saved value is read by /calendar on every fresh visit (no `?view=`
 * URL param). Once the user changes the view via the toggle on the
 * calendar itself, the URL state takes over for the rest of that
 * session.
 */
export function CalendarPreferencesSection({
  initialView,
}: {
  initialView: ViewMode;
}) {
  const [view, setView] = useState<ViewMode>(initialView);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const form = new FormData();
    form.set("default_calendar_view", String(view));

    const result = await updateDefaultCalendarViewAction(form);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const label =
      view === 1
        ? "1 month"
        : view === 3
        ? "3 months"
        : view === 6
        ? "6 months"
        : "12 months";
    setMessage(`Default calendar view set to ${label}.`);
  }

  return (
    <section className="border border-slate-200 rounded-lg p-5 bg-white space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-indigo-700">
          Calendar preferences
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          What view should the calendar open to by default? You can still
          flip between views any time using the toggle on the calendar
          page itself.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2 text-sm">
          {([1, 3, 6, 12] as ViewMode[]).map((v) => (
            <label
              key={v}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <input
                type="radio"
                name="default_calendar_view"
                value={v}
                checked={view === v}
                onChange={() => setView(v)}
                className="mt-0.5"
              />
              <span>
                <strong className="text-slate-900">
                  {v === 1 ? "1 month" : `${v} months`}
                </strong>
                <span className="block text-xs text-slate-500">
                  {v === 1
                    ? "Detailed grid for the current month — full booking pills with time and venue."
                    : v === 3
                    ? "Quarter view — three mini-month tiles side by side."
                    : v === 6
                    ? "Half year — six mini-month tiles for medium-range planning."
                    : "Year view — twelve mini-month tiles, ideal for an at-a-glance season overview."}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="btn btn-md btn-primary"
          >
            {pending ? "Saving…" : "Save preference"}
          </button>
          {message && (
            <span className="text-xs text-emerald-700">{message}</span>
          )}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </form>
    </section>
  );
}
