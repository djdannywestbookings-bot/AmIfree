"use client";

/**
 * VenueMapPreview — Phase 37.
 *
 * Renders a Google Maps embed iframe given a free-form address. No
 * API key required — Google's embed URL accepts ?q=ADDRESS as a
 * search query and pins the best match. Free for all callers as
 * long as it's not used commercially with their Maps Embed API
 * (which requires a key); the simple maps?q= form has been embed-
 * safe for years.
 *
 * If we later want offline-cached lat/lng or geo search, we'll
 * upgrade to the Maps JavaScript API + a key.
 */
export function VenueMapPreview({ address }: { address: string | null }) {
  if (!address || address.trim().length === 0) {
    return (
      <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-xs text-neutral-500">
        Add an address above to see a map preview.
      </div>
    );
  }
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address.trim())}&output=embed`;
  return (
    <div className="rounded-md overflow-hidden border border-neutral-200">
      <iframe
        title={`Map of ${address}`}
        src={src}
        className="w-full h-64 border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`}
        target="_blank"
        rel="noreferrer"
        className="block px-3 py-2 text-xs text-indigo-600 hover:text-indigo-700 bg-white border-t border-neutral-200"
      >
        Open in Google Maps →
      </a>
    </div>
  );
}
