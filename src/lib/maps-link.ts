/**
 * Build a Maps URL for an address.
 *
 * Returns a Google Maps search URL — on iOS this opens Apple Maps
 * via the system URL scheme handler if the user has Apple Maps as
 * default, on Android it opens Google Maps, on desktop it opens the
 * browser. The single URL works everywhere.
 *
 * Used by venue cards / shift detail so an address tap launches turn-
 * by-turn directions in whatever Maps app the user prefers.
 */
export function buildMapsUrl(...parts: Array<string | null | undefined>): string | null {
  const joined = parts
    .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    .map((p) => p.trim())
    .join(", ");
  if (!joined) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(joined)}`;
}
