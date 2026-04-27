"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { bulkExtractAction, bulkSaveBookingsAction, type BulkSaveResponse } from "../bulk-actions";
import type { ExtractionResult } from "@/server/services/extraction";
import { BOOKING_STATUSES } from "@/modules/bookings";

const MAX_IMAGES = 8;
const MAX_IMAGE_RAW_BYTES = 5 * 1024 * 1024;
const MAX_SPREADSHEET_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
// Plain-text spreadsheet exports only. For real .xlsx/.xls files,
// users can copy cells directly from Excel/Sheets — copying always
// puts TSV on the clipboard, which works in the textarea.
const SPREADSHEET_EXTENSIONS = [".csv", ".tsv", ".txt"];
// File picker accepts both images and spreadsheets.
const FILE_PICKER_ACCEPT = [
  ...ACCEPTED_IMAGE_TYPES,
  ...SPREADSHEET_EXTENSIONS,
].join(",");

type UploadedImage = {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsText(file);
  });
}

function isSpreadsheetFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return SPREADSHEET_EXTENSIONS.some((ext) => name.endsWith(ext));
}

/**
 * Lightweight CSV → TSV converter. Handles quoted fields with commas
 * inside ("Smith, John") and escaped quotes (""). For .tsv just returns
 * the content as-is.
 */
function csvToTsv(csv: string): string {
  const out: string[] = [];
  for (const line of csv.split(/\r?\n/)) {
    if (line.length === 0) {
      out.push("");
      continue;
    }
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ",") {
          cells.push(current);
          current = "";
        } else current += ch;
      }
    }
    cells.push(current);
    out.push(cells.join("\t"));
  }
  return out.join("\n");
}

/**
 * Parse a CSV/TSV/TXT file to a TSV string the bulk extractor can ingest.
 * For .xlsx/.xls users should copy cells directly into the textarea —
 * spreadsheet apps already put TSV on the clipboard.
 */
async function parseSpreadsheetToTsv(file: File): Promise<string> {
  const text = await readFileAsText(file);
  if (file.name.toLowerCase().endsWith(".csv")) {
    return csvToTsv(text);
  }
  return text;
}

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
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftRow[] | null>(null);
  const [topWarnings, setTopWarnings] = useState<string[]>([]);
  const [saveResult, setSaveResult] = useState<BulkSaveResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || (files as FileList).length === 0) return;
    const list = Array.from(files);

    setError(null);

    const acceptedImages: UploadedImage[] = [];
    const spreadsheetTextBlocks: string[] = [];
    let imageSlotsLeft = MAX_IMAGES - images.length;

    for (const file of list) {
      if (isSpreadsheetFile(file)) {
        if (file.size > MAX_SPREADSHEET_BYTES) {
          setError(`"${file.name}" is over 10 MB.`);
          continue;
        }
        try {
          const tsv = await parseSpreadsheetToTsv(file);
          if (tsv.trim().length > 0) {
            spreadsheetTextBlocks.push(tsv);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "parse failed";
          setError(`Could not parse "${file.name}": ${msg}`);
        }
        continue;
      }

      if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        if (imageSlotsLeft <= 0) {
          setError(
            `You can upload up to ${MAX_IMAGES} images at a time. Drop the extras and re-add later.`,
          );
          continue;
        }
        if (file.size > MAX_IMAGE_RAW_BYTES) {
          setError(`"${file.name}" is over 5 MB.`);
          continue;
        }
        try {
          const dataUrl = await readFileAsDataUrl(file);
          acceptedImages.push({
            id: `${file.name}-${file.size}-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,
            name: file.name,
            dataUrl,
            size: file.size,
          });
          imageSlotsLeft -= 1;
        } catch {
          setError(`Failed to read "${file.name}".`);
        }
        continue;
      }

      setError(
        `"${file.name}" isn't a supported file. Use PNG/JPG/WEBP for images or CSV/TSV/XLSX for spreadsheets.`,
      );
    }

    if (acceptedImages.length > 0) {
      setImages((prev) => [...prev, ...acceptedImages]);
    }
    if (spreadsheetTextBlocks.length > 0) {
      setText((prev) =>
        [prev.trim(), ...spreadsheetTextBlocks]
          .filter((s) => s.length > 0)
          .join("\n\n"),
      );
    }
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    void handleFiles(event.target.files);
    // Reset so re-selecting the same file re-fires the change.
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    void handleFiles(event.dataTransfer.files);
  }

  async function handleExtract(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (text.trim().length === 0 && images.length === 0) {
      setError("Paste some text or upload at least one image.");
      return;
    }
    setPending(true);
    setError(null);
    setSaveResult(null);

    const form = new FormData();
    form.set("text", text);
    images.forEach((img, i) => {
      form.set(`image_${i}`, img.dataUrl);
    });
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
            Paste a message, list, or table
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            maxLength={50_000}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
          />
        </label>

        <div>
          <span className="block text-sm font-medium text-neutral-700 mb-1">
            …or drop files here
          </span>
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`rounded-md border-2 border-dashed p-6 text-center transition-colors ${
              dragActive
                ? "border-neutral-900 bg-neutral-50"
                : "border-neutral-300 bg-white"
            }`}
          >
            <p className="text-sm text-neutral-700 mb-1">
              Drag &amp; drop screenshots or spreadsheets here
            </p>
            <p className="text-xs text-neutral-500 mb-3">
              Images: PNG / JPG / WEBP, up to {MAX_IMAGES} files, 5 MB each.{" "}
              <br />
              Spreadsheets: CSV / TSV / TXT, parsed inline into the text
              above. For .xlsx, copy cells directly from Excel/Sheets and
              paste into the textarea above (Excel copies as tab-separated).
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Choose files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={FILE_PICKER_ACCEPT}
              multiple
              onChange={onFileInput}
              className="hidden"
            />
          </div>

          {images.length > 0 && (
            <ul className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img) => (
                <li
                  key={img.id}
                  className="relative border border-neutral-200 rounded-md overflow-hidden bg-neutral-50 group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.dataUrl}
                    alt={img.name}
                    className="w-full h-24 object-cover"
                  />
                  <div className="px-2 py-1 text-[11px] text-neutral-600 truncate">
                    {img.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    aria-label={`Remove ${img.name}`}
                    className="absolute top-1 right-1 rounded bg-white/90 border border-neutral-300 px-1.5 py-0.5 text-[11px] hover:bg-red-50 hover:border-red-300 hover:text-red-700 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            Paste tab-separated rows from a spreadsheet, or drop screenshots
            of texts/emails/calendars. AI extracts what it sees and hands you
            a draft to review before saving.
          </p>
          <button
            type="submit"
            disabled={
              pending || (text.trim().length === 0 && images.length === 0)
            }
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
