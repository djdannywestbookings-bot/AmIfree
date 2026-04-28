"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createVenueAction, updateVenueAction } from "../actions";
import { importVenueFromUrlAction } from "../import-actions";
import type { VenueRow } from "@/modules/venues";
import { VenueColorPicker } from "./VenueColorPicker";
import { VenueMapPreview } from "./VenueMapPreview";

/**
 * Reusable venue form. Handles both create (no `existing` prop) and
 * edit (existing populated). On submit it routes to the right server
 * action.
 *
 * On create success, resets the form.
 * On edit success, the server action redirects to /venues.
 *
 * Phase 37: adds contact name, contact phone, notes, and a map
 * preview that updates as the address is typed.
 */
export function VenueForm({
  existing,
  initialImportUrl,
}: {
  existing?: VenueRow;
  /**
   * If provided (e.g. from Web Share Target landing on
   * /venues/new?import_url=…), the form auto-runs the importer on
   * mount and clears the URL param so a refresh doesn't re-import.
   */
  initialImportUrl?: string;
}) {
  const isEdit = Boolean(existing);
  const [name, setName] = useState(existing?.name ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [color, setColor] = useState(existing?.color ?? "");
  const [contactName, setContactName] = useState(existing?.contact_name ?? "");
  const [contactPhone, setContactPhone] = useState(existing?.contact_phone ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Maps import row state.
  const [importUrl, setImportUrl] = useState(initialImportUrl ?? "");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const autoImportFiredRef = useRef(false);

  async function runImport(urlToImport: string) {
    if (!urlToImport.trim()) {
      setImportError("Paste a Google Maps URL first.");
      return;
    }
    setImporting(true);
    setImportError(null);
    setImportMessage(null);

    const form = new FormData();
    form.set("url", urlToImport);
    const result = await importVenueFromUrlAction(form);
    setImporting(false);

    if (!result.ok) {
      setImportError(result.error);
      return;
    }
    if (result.name) setName(result.name);
    if (result.address) setAddress(result.address);
    if (result.phone) setContactPhone(result.phone);

    const got: string[] = [];
    if (result.name) got.push("name");
    if (result.address) got.push("address");
    if (result.phone) got.push("phone");
    const missing: string[] = [];
    if (!result.name) missing.push("name");
    if (!result.address) missing.push("address");

    if (missing.length === 0) {
      setImportMessage("Imported. Review the fields and save.");
    } else if (got.length > 0) {
      setImportMessage(
        `Got ${got.join(" + ")}. Couldn't read ${missing.join(" + ")} — fill in below.`,
      );
    }
    setImportUrl("");
  }

  function handleImport() {
    void runImport(importUrl);
  }

  // Web Share Target hand-off: if the page was opened from a native
  // share sheet (manifest declares /venues/new as a share_target),
  // auto-run the importer on mount and clear the URL param so a
  // refresh doesn't re-fire.
  useEffect(() => {
    if (autoImportFiredRef.current) return;
    if (!initialImportUrl || initialImportUrl.trim().length === 0) return;
    autoImportFiredRef.current = true;
    void runImport(initialImportUrl);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("import_url");
      url.searchParams.delete("share_title");
      window.history.replaceState(null, "", url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImportUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData();
    form.set("name", name);
    if (address) form.set("address", address);
    if (color) form.set("color", color);
    if (contactName) form.set("contact_name", contactName);
    if (contactPhone) form.set("contact_phone", contactPhone);
    if (notes) form.set("notes", notes);

    if (isEdit && existing) {
      form.set("id", existing.id);
      const result = await updateVenueAction(form);
      setPending(false);
      if (result && !result.ok) setError(result.error);
      // Success path redirects via the action.
      return;
    }

    const result = await createVenueAction(form);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // Reset on successful create.
    setName("");
    setAddress("");
    setColor("");
    setContactName("");
    setContactPhone("");
    setNotes("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border border-neutral-200 rounded-md p-4 bg-white"
    >
      {/* Google Maps import — optional fast path. The user can also
       *  fill the form manually below; this just pre-fills name + address.
       */}
      <div className="rounded-md border border-indigo-200 bg-indigo-50/40 p-3 space-y-2">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <span className="block text-xs font-medium text-indigo-900">
            Import from Google Maps
          </span>
          <span className="text-[11px] text-slate-500">
            Paste a share link — we&rsquo;ll fill in the name + address.
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <input
            type="url"
            value={importUrl}
            onChange={(e) => {
              setImportUrl(e.target.value);
              setImportError(null);
            }}
            placeholder="https://maps.app.goo.gl/…"
            className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm bg-white"
          />
          <button
            type="button"
            onClick={handleImport}
            disabled={importing || importUrl.trim().length === 0}
            className="rounded bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-sm font-medium disabled:opacity-50 transition-colors shrink-0"
          >
            {importing ? "Importing…" : "Import"}
          </button>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-800 underline-offset-2 hover:underline"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Find on Google Maps
            <span aria-hidden>↗</span>
          </a>
          <span className="text-slate-400">·</span>
          <span>
            On phone? Install AmIFree to your home screen, then use{" "}
            <em>Share → AmIFree</em> from any Maps page.
          </span>
        </div>
        {importMessage && (
          <p className="text-xs text-emerald-700">{importMessage}</p>
        )}
        {importError && (
          <p className="text-xs text-red-600" role="alert">
            {importError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column: identity + contact */}
        <div className="space-y-3">
          <label className="block">
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Venue name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Address
            </span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={500}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>

          <div>
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Color
            </span>
            <VenueColorPicker value={color} onChange={setColor} name="_venue_color" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-neutral-700 mb-1">
                Contact
              </span>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                maxLength={200}
                className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-neutral-700 mb-1">
                Phone
              </span>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                maxLength={60}
                className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Notes
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={5000}
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>
        </div>

        {/* Right column: map preview */}
        <div className="space-y-2">
          <span className="block text-xs font-medium text-neutral-700">
            Map preview
          </span>
          <VenueMapPreview address={address} />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 text-sm disabled:opacity-50 transition-colors"
        >
          {pending ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save changes" : "Create venue"}
        </button>
        {isEdit && (
          <a
            href="/venues"
            className="text-xs rounded border border-neutral-300 py-2 px-4 hover:bg-neutral-50"
          >
            Cancel
          </a>
        )}
      </div>
    </form>
  );
}
