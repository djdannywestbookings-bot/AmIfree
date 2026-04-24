"use client";

import { useState, type FormEvent } from "react";
import { extractFromTextAction, saveExtractedBookingAction } from "../actions";
import type { ExtractionResult } from "@/server/services/extraction";
import { BOOKING_STATUSES } from "@/modules/bookings";
import { DatePicker } from "../../agenda/_components/DatePicker";
import { TimeInput } from "../../agenda/_components/TimeInput";
import { DurationInput } from "../../agenda/_components/DurationInput";

/**
 * Intake flow. Phase 25A.
 *
 * Two stages inside a single page:
 *   1. Paste stage — big textarea + "Extract" button.
 *   2. Review stage — pre-filled form rendered from the extraction
 *      result, with every field editable. User clicks "Save booking"
 *      to commit. "Start over" resets back to paste stage.
 *
 * Works with or without an OPENAI_API_KEY — the extraction service
 * falls back to heuristic parsing if no key is set. The UI renders
 * either result identically.
 */

function splitIsoToDateAndTime(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  const yyyy = String(d.getFullYear()).padStart(4, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const MM = String(d.getMinutes()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${HH}:${MM}` };
}

function combineDateAndTime(date: string, time: string): string | null {
  const dMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const tMatch = time.match(/^(\d{2}):(\d{2})$/);
  if (!dMatch || !tMatch) return null;
  const d = new Date(
    Number(dMatch[1]),
    Number(dMatch[2]) - 1,
    Number(dMatch[3]),
    Number(tMatch[1]),
    Number(tMatch[2]),
    0,
    0,
  );
  return d.toISOString();
}

function durationMinutesFromStartEnd(
  startIso: string | null,
  endIso: string | null,
): string {
  if (!startIso || !endIso) return "";
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return "";
  return String(Math.round((e - s) / 60_000));
}

export function IntakeForm() {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);

  // Review stage form state
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("inquiry");
  const [allDay, setAllDay] = useState(false);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [location, setLocation] = useState("");
  const [pay, setPay] = useState("");
  const [notes, setNotes] = useState("");

  async function handleExtract(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData();
    form.set("text", text);
    const result = await extractFromTextAction(form);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const e = result.extraction;
    const { date: d, time: t } = splitIsoToDateAndTime(e.start_at);
    setTitle(e.title ?? "");
    setStatus(e.status ?? "inquiry");
    setAllDay(e.all_day);
    setDate(d);
    setStartTime(t);
    setDurationMinutes(durationMinutesFromStartEnd(e.start_at, e.end_at));
    setLocation(e.location ?? "");
    setPay(e.pay ?? "");
    setNotes(e.notes ?? text);
    setExtraction(e);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData();
    form.set("title", title);
    form.set("status", status);
    if (allDay) form.set("all_day", "on");

    if (date && startTime) {
      const combined = combineDateAndTime(date, startTime);
      if (combined) {
        form.set("start_at", combined);
        if (durationMinutes) {
          const mins = Number(durationMinutes);
          if (Number.isFinite(mins) && mins > 0) {
            const end = new Date(new Date(combined).getTime() + mins * 60_000);
            form.set("end_at", end.toISOString());
          }
        }
      }
    } else if (date && allDay) {
      form.set("start_at", combineDateAndTime(date, "00:00") ?? "");
    }

    if (location) form.set("location", location);
    if (pay) form.set("pay", pay);
    if (notes) form.set("notes", notes);

    const result = await saveExtractedBookingAction(form);
    // saveExtractedBookingAction redirects on success; if it returns,
    // something went wrong.
    setPending(false);
    if (result && !result.ok) {
      setError(result.error);
    }
  }

  function resetToPaste() {
    setExtraction(null);
    setError(null);
  }

  if (!extraction) {
    return (
      <form onSubmit={handleExtract} className="space-y-3">
        <label className="block">
          <span className="block text-sm font-medium text-neutral-700 mb-1">
            Paste a message, email, or invoice
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            maxLength={20_000}
            required
            placeholder={
              "Hey Danny, you free April 26 at 10pm at Bottle Blonde Dallas? 4 hour set, $300. Reply asap."
            }
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            AmIFree will pull out date, time, location, and pay where it can,
            and hand the draft to you for review before saving.
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

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-neutral-200 bg-white p-3 text-xs text-neutral-600 space-y-1">
        <div>
          Extracted via{" "}
          <strong>
            {extraction.source === "openai" ? "OpenAI" : "heuristic parser"}
          </strong>
          {" · "}
          confidence {Math.round(extraction.confidence * 100)}%
        </div>
        {extraction.warnings.length > 0 && (
          <ul className="list-disc list-inside text-amber-700">
            {extraction.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-3 border border-neutral-200 rounded-md p-4 bg-white">
        <label className="block">
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Title
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Status
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm bg-white"
            >
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
            />
            <span className="text-xs text-neutral-700">All day</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Date
            </span>
            <DatePicker value={date} onChange={setDate} name="_intake_date" />
          </div>

          <div>
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Start time
            </span>
            <TimeInput
              value={startTime}
              onChange={setStartTime}
              name="_intake_start"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Duration
            </span>
            <DurationInput
              value={durationMinutes}
              onChange={setDurationMinutes}
              name="_intake_duration"
            />
          </div>
        </div>

        <label className="block">
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Location
          </span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={500}
            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Pay
          </span>
          <input
            type="text"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            maxLength={200}
            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            maxLength={10000}
            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </label>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-neutral-900 text-white py-2 px-4 text-sm disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save booking"}
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
      </form>
    </div>
  );
}
