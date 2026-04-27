"use client";

import { useState, type FormEvent } from "react";
import { createVenueAction, updateVenueAction } from "../actions";
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
