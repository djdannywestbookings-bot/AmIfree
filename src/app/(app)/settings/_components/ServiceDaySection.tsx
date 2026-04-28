"use client";

import { useState, type FormEvent } from "react";
import { updateServiceDayAction } from "../service-day-actions";

/**
 * Service-day section — controls how a "day" is defined for booking
 * purposes. Standard rolls over at midnight; nightlife rolls over at
 * a configurable early-morning hour so a 1am Saturday gig still reads
 * as Friday's calendar day.
 */
export function ServiceDaySection({
  initialMode,
  initialCutoffHour,
}: {
  initialMode: "standard" | "nightlife";
  initialCutoffHour: number;
}) {
  const [mode, setMode] = useState<"standard" | "nightlife">(initialMode);
  const [cutoffHour, setCutoffHour] = useState(initialCutoffHour);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const form = new FormData();
    form.set("service_day_mode", mode);
    form.set("nightlife_cutoff_hour", String(cutoffHour));

    const result = await updateServiceDayAction(form);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage("Service day saved.");
  }

  return (
    <section className="border border-slate-200 rounded-lg p-5 bg-white space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-indigo-700">Service day</h2>
        <p className="text-sm text-slate-600 mt-1">
          When does your &ldquo;day&rdquo; end? Nightlife mode keeps a
          1am Saturday gig grouped with Friday so late shifts don&rsquo;t
          jump to the next day on your schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2 text-sm">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="service_day_mode"
              value="standard"
              checked={mode === "standard"}
              onChange={() => setMode("standard")}
              className="mt-0.5"
            />
            <span>
              <strong className="text-slate-900">Standard</strong>
              <span className="block text-xs text-slate-500">
                Day rolls over at midnight (default).
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="service_day_mode"
              value="nightlife"
              checked={mode === "nightlife"}
              onChange={() => setMode("nightlife")}
              className="mt-0.5"
            />
            <span>
              <strong className="text-slate-900">Nightlife</strong>
              <span className="block text-xs text-slate-500">
                Day rolls over at the cutoff hour below — late-night sets
                still belong to the previous day.
              </span>
            </span>
          </label>
        </div>

        {mode === "nightlife" && (
          <label className="block">
            <span className="block text-xs font-medium text-slate-700 mb-1">
              Cutoff hour (0–12)
            </span>
            <input
              type="number"
              min={0}
              max={12}
              value={cutoffHour}
              onChange={(e) =>
                setCutoffHour(Math.max(0, Math.min(12, Number(e.target.value))))
              }
              className="input w-32"
            />
            <span className="block text-[11px] text-slate-500 mt-1">
              e.g. <strong>6</strong> means the day ends at 6am — anything
              before 6am counts as the previous day.
            </span>
          </label>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="btn btn-md btn-primary"
          >
            {pending ? "Saving…" : "Save service day"}
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
