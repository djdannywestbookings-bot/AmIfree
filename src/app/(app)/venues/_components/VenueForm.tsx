"use client";

import { useState, type FormEvent } from "react";
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
export function VenueForm({ existing }: { existing?: VenueRow }) {
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
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  async function handleImport() {
    if (!importUrl.trim()) {
      setImportError("Paste a Google Maps URL first.");
      return;
    }
    setImporting(true);
    setImportError(null);
    setImportMessage(null);

    const form = new FormData();
    form.set("url", importUrl);
    const result = await importVenueFromUrlAction(form);
    setImporting(false);

    if (!result.ok) {
      setImportError(result.error);
      return;
    }
    if (result.name) setName(result.name);
    if (result.address) setAddress(result.address);

    if (result.name && result.address) {
      setImportMessage("Imported. Review the fields and save.");
    } else if (result.name) {
      setImportMessage(
        "Got the venue name. Couldn't read the address — fill it in below.",
      );
    } else if (result.address) {
      setImportMessage(
        "Got the address. Couldn't read the name — fill it in below.",
      );
    }
    setImportUrl("");
  }

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
              placeholder="Bottle Blonde, The Grand Ballroom, Studio West"
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
              placeholder="1 AT&T Way, Arlington, TX 76011"
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
                placeholder="GM, security, promoter…"
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
                placeholder="(555) 555-5555"
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
              placeholder="Load-in details, parking, house engineer, door splits, anything that helps next time."
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
