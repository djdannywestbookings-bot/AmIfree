"use client";

import { useState, type FormEvent } from "react";
import { bulkExtractAction, bulkSaveBookingsAction, type BulkSaveResponse } from "../bulk-actions";
import type { ExtractionResult } from "@/server/services/extraction";
import { BOOKING_STATUSES } from "@/modules/bookings";

/**
 * Bulk intake. Phase 31.
 *
 * Stage 1: paste a table or list, click Extract.
 * Stage 2: review extracted rows in a card-per-row layout. Each field
 *          is editable. User can delete a row, then click Save all.
 *
 * Save calls bulkSaveBookingsAction with a JSON payload — server does
 * sequential createBooking calls and returns per-row success/error.
 */

type DraftRow = {
  id: string; // local-only client id for keying rows
  title: string;
  status: string;
  start_at: string | null; // ISO string or null
  end_at: string | null;
  all_day: boolean;
  location: string;
  pay: string;
  notes: string;
  warnings: string[];
  source: "openai" | "heuristic";
  confidence: number;
};

let __rowCounter = 0;
function nextRowId() {
  __rowCounter += 1;
  return `row-${__rowCounter}`;
}

function isoToLocalDateTime(iso: string | null): string {
  // Returns "YYYY-MM-DDTHH:MM" formatted for <input type=datetime-local>.
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = String(d.getFullYear()).padStart(4, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const MM = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${HH}:${MM}`;
}

function localDateTimeToIso(local: string): string | null {
  // input value is "YYYY-MM-DDTHH:MM" in local time.
  if (!local) return null;
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  const d = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    0,
    0,
  );
  return d.toISOString();
}

function extractionToDraft(e: ExtractionResult): DraftRow {
  return {
    id: nextRowId(),
    title: e.title ?? "",
    status: e.status ?? "inquiry",
    start_at: e.start_at,
    end_at: e.end_at,
    all_day: e.all_day,
    location: e.location ?? "",
    pay: e.pay ?? "",
    notes: e.notes ?? "",
    warnings: e.warnings,
    source: e.source,
    confidence: e.confidence,
  };
}

export function BulkIntakeForm() {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftRow[] | null>(null);
  const [topWarnings, setTopWarnings] = useState<string[]>([]);
  const [saveResult, setSaveResult] = useState<BulkSaveResponse | null>(null);

  async function handleExtract(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaveResult(null);

    const form = new FormData();
    form.set("text", text);
    const result = await bulkExtractAction(form);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setDrafts(result.result.bookings.map(extractionToDraft));
    setTopWarnings(result.result.warnings);
  }

  function patchDraft(id: string, patch: Partial<DraftRow>) {
    setDrafts((prev) =>
      prev ? prev.map((r) => (r.id === id ? { ...r, ...patch } : r)) : prev,
    );
  }

  function removeDraft(id: string) {
    setDrafts((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
  }

  async function handleSaveAll() {
    if (!drafts || drafts.length === 0) return;
    setPending(true);
    setError(null);
    setSaveResult(null);

    // Validate before sending — must have a title.
    const missingTitle = drafts.findIndex((d) => d.title.trim().length === 0);
    if (missingTitle >= 0) {
      setPending(false);
      setError(
        `Row ${missingTitle + 1} is missing a title. Fix it or remove the row.`,
      );
      return;
    }

    const payload = {
      rows: drafts.map((d) => ({
        title: d.title.trim(),
        status: d.status,
        start_at: d.start_at,
        end_at: d.end_at,
        all_day: d.all_day,
        location: d.location || null,
        pay: d.pay || null,
        notes: d.notes || null,
      })),
    };

    const result = await bulkSaveBookingsAction(JSON.stringify(payload));
    setPending(false);
    setSaveResult(result);

    // Drop saved rows from the drafts so user can fix only the failures.
    if (result.errors.length === 0) {
      setDrafts([]);
    } else {
      const errIdx = new Set(result.errors.map((e) => e.index));
      setDrafts((prev) =>
        prev ? prev.filter((_, i) => errIdx.has(i)) : prev,
      );
    }
  }

  function resetToPaste() {
    setDrafts(null);
    setTopWarnings([]);
    setSaveResult(null);
    setError(null);
  }

  // ---- Stage 1: paste ----------------------------------------------------
  if (drafts === null) {
    return (
      <form onSubmit={handleExtract} className="space-y-3">
        <label className="block">
          <span className="block text-sm font-medium text-neutral-700 mb-1">
            Paste a table or list (one booking per row)
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            maxLength={50_000}
            required
            placeholder={
              "04/28/2026\tTuesday\tBucks\tBucks\t10:00 PM-2:00 AM\t$300\tRecurring Tuesday\tBooked\n05/02/2026\tSaturday\tCinco event\tUnknown\t10:00 PM start\tUnknown\tAdam TXR contact\tBooked"
            }
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            Paste tab-separated rows from a spreadsheet, or any text with
            multiple bookings. AI will pull each row into a draft for you to
            review before saving.
          </p>
          <button
            type="submit"
            disabled={pending || text.trim().length === 0}
            className="rounded bg-neutral-900 text-white py-2 px-4 text-sm disabled:opacity-50 shrink-0"
          >
            {pending ? "Extracting…" : "Extract"}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </form>
    );
  }

  // ---- Stage 2: review --------------------------------------------------
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-neutral-200 bg-white p-3 text-xs text-neutral-600 space-y-1">
        <div>
          {drafts.length} booking{drafts.length === 1 ? "" : "s"} extracted ·
          source{" "}
          <strong>
            {drafts[0]?.source === "openai" ? "OpenAI" : "heuristic parser"}
          </strong>
        </div>
        {topWarnings.length > 0 && (
          <ul className="list-disc list-inside text-amber-700">
            {topWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
      </div>

      {saveResult && (
        <div
          className={`rounded-md border p-3 text-sm ${
            saveResult.ok
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          <div className="font-medium">
            Saved {saveResult.created} booking
            {saveResult.created === 1 ? "" : "s"}
            {saveResult.errors.length > 0 &&
              ` · ${saveResult.errors.length} failed`}
          </div>
          {saveResult.errors.length > 0 && (
            <ul className="list-disc list-inside text-xs mt-1">
              {saveResult.errors.map((e, i) => (
                <li key={i}>
                  Row {e.index + 1} ({e.title || "(no title)"}): {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="border border-dashed border-neutral-300 rounded-md p-8 text-center text-sm text-neutral-500">
          All rows saved. Nothing left to review.
        </div>
      ) : (
        <ul className="space-y-3">
          {drafts.map((d, i) => (
            <li
              key={d.id}
              className="border border-neutral-200 rounded-md p-3 bg-white space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-neutral-500">
                  Row {i + 1}
                  {d.confidence > 0 && (
                    <span className="ml-2 text-neutral-400">
                      · {Math.round(d.confidence * 100)}% confidence
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => removeDraft(d.id)}
                  className="text-xs rounded border border-red-200 text-red-700 px-2 py-1 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>

              {d.warnings.length > 0 && (
                <ul className="list-disc list-inside text-xs text-amber-700">
                  {d.warnings.map((w, wi) => (
                    <li key={wi}>{w}</li>
                  ))}
                </ul>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="block sm:col-span-2">
                  <span className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                    Title
                  </span>
                  <input
                    type="text"
                    value={d.title}
                    onChange={(e) =>
                      patchDraft(d.id, { title: e.target.value })
                    }
                    required
                    maxLength={200}
                    className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                    Status
                  </span>
                  <select
                    value={d.status}
                    onChange={(e) =>
                      patchDraft(d.id, { status: e.target.value })
                    }
                    className="w-full rounded border border-neutral-300 px-2 py-1 text-sm bg-white"
                  >
                    {BOOKING_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="block">
                  <span className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                    Start
                  </span>
                  <input
                    type="datetime-local"
                    value={isoToLocalDateTime(d.start_at)}
                    onChange={(e) =>
                      patchDraft(d.id, {
                        start_at: localDateTimeToIso(e.target.value),
                      })
                    }
                    className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                    End
                  </span>
                  <input
                    type="datetime-local"
                    value={isoToLocalDateTime(d.end_at)}
                    onChange={(e) =>
                      patchDraft(d.id, {
                        end_at: localDateTimeToIso(e.target.value),
                      })
                    }
                    className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="block">
                  <span className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                    Location
                  </span>
                  <input
                    type="text"
                    value={d.location}
                    onChange={(e) =>
                      patchDraft(d.id, { location: e.target.value })
                    }
                    maxLength={500}
                    className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                    Pay
                  </span>
                  <input
                    type="text"
                    value={d.pay}
                    onChange={(e) =>
                      patchDraft(d.id, { pay: e.target.value })
                    }
                    maxLength={200}
                    className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-[11px] font-medium text-neutral-600 mb-0.5">
                  Notes
                </span>
                <textarea
                  value={d.notes}
                  onChange={(e) => patchDraft(d.id, { notes: e.target.value })}
                  rows={2}
                  maxLength={10000}
                  className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                />
              </label>

              <label className="flex items-center gap-2 text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={d.all_day}
                  onChange={(e) =>
                    patchDraft(d.id, { all_day: e.target.checked })
                  }
                />
                All day
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 pt-1 sticky bottom-0 bg-white py-3 border-t border-neutral-200">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={pending || drafts.length === 0}
          className="rounded bg-neutral-900 text-white py-2 px-4 text-sm disabled:opacity-50"
        >
          {pending
            ? "Saving…"
            : `Save ${drafts.length} booking${drafts.length === 1 ? "" : "s"}`}
        </button>
        <button
          type="button"
          onClick={resetToPaste}
          className="rounded border border-neutral-300 py-2 px-4 text-sm hover:bg-neutral-50"
        >
          Start over
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
