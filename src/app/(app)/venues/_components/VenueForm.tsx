"use client";

import { useState, type FormEvent } from "react";
import { createVenueAction, updateVenueAction } from "../actions";
import type { VenueRow } from "@/modules/venues";
import { VenueColorPicker } from "./VenueColorPicker";

/**
 * Reusable venue form. Handles both create (no `existing` prop) and
 * edit (existing populated). On submit it routes to the right server
 * action.
 *
 * On create success, resets the form.
 * On edit success, the server action redirects to /venues.
 */
export function VenueForm({ existing }: { existing?: VenueRow }) {
  const isEdit = Boolean(existing);
  const [name, setName] = useState(existing?.name ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [color, setColor] = useState(existing?.color ?? "");
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
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border border-neutral-200 rounded-md p-4 bg-white"
    >
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
          Address (optional)
        </span>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          maxLength={500}
          placeholder="Street, city, state"
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>

      <div>
        <span className="block text-xs font-medium text-neutral-700 mb-1">
          Color
        </span>
        <VenueColorPicker value={color} onChange={setColor} name="_venue_color" />
      </div>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-neutral-900 text-white py-2 px-4 text-sm disabled:opacity-50"
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
