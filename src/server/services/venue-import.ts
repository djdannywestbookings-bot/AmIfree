import "server-only";

/**
 * Best-effort venue importer for pasted Google Maps URLs.
 *
 * Two URL shapes we handle:
 *   - https://maps.app.goo.gl/<id>             (short share link)
 *   - https://www.google.com/maps/place/<...>  (long URL)
 *
 * Strategy:
 *   1. Fetch the URL with a desktop User-Agent + follow redirects.
 *   2. The redirect chain typically ends at
 *      `https://www.google.com/maps/place/<URL-encoded name>/@lat,lng,zoom/data=...`
 *      The place name is right there in the path.
 *   3. Scan the HTML body for an address — JSON-LD structured data,
 *      `<meta itemprop="address">`, or the page <title>'s suffix.
 *
 * If parsing fails we surface { ok: false, error } and let the user
 * fill the form manually — the field is purely a convenience.
 */

const ALLOWED_HOSTS = new Set([
  "maps.app.goo.gl",
  "goo.gl",
  "www.google.com",
  "google.com",
  "maps.google.com",
]);

const DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export type VenueImportResult =
  | { ok: true; name: string; address: string | null; sourceUrl: string }
  | { ok: false; error: string };

export async function extractVenueFromMapsUrl(
  rawUrl: string,
): Promise<VenueImportResult> {
  const trimmed = rawUrl.trim();
  if (!trimmed) return { ok: false, error: "Paste a Google Maps URL first." };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: "That doesn't look like a URL." };
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return {
      ok: false,
      error: "Only Google Maps URLs are supported right now.",
    };
  }

  // Fetch with redirect follow + 6-second timeout.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  let response: Response;
  try {
    response = await fetch(trimmed, {
      method: "GET",
      headers: {
        "User-Agent": DESKTOP_UA,
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      ok: false,
      error:
        err instanceof Error && err.name === "AbortError"
          ? "Google Maps took too long to respond. Try pasting again."
          : "Couldn't reach Google Maps. Check the link.",
    };
  }
  clearTimeout(timeoutId);

  // Final URL after redirects — `response.url` reflects the last hop.
  const finalUrl = response.url;
  let body = "";
  try {
    body = await response.text();
  } catch {
    /* ignore — we can still parse from the URL alone */
  }

  // 1. Place name from the /place/<encoded>/ segment.
  const placeName = extractPlaceNameFromUrl(finalUrl);

  // 2. Address — try multiple sources, in order of reliability.
  const address =
    extractAddressFromJsonLd(body) ??
    extractAddressFromMeta(body) ??
    extractAddressFromTitleSuffix(body, placeName) ??
    null;

  if (!placeName && !address) {
    return {
      ok: false,
      error: "Couldn't read this Google Maps link. Fill the venue manually.",
    };
  }

  return {
    ok: true,
    name: placeName ?? "",
    address,
    sourceUrl: finalUrl,
  };
}

/* -------------------------------------------------------------------------- *
 * Internals
 * -------------------------------------------------------------------------- */

function extractPlaceNameFromUrl(url: string): string | null {
  // Match /maps/place/<URL-encoded name>/...
  const match = url.match(/\/maps\/place\/([^/?#]+)/i);
  if (!match) return null;
  try {
    // Plus signs in the path map to spaces in the original name.
    const decoded = decodeURIComponent(match[1].replace(/\+/g, " "));
    return decoded.trim() || null;
  } catch {
    return null;
  }
}

function extractAddressFromJsonLd(body: string): string | null {
  if (!body) return null;
  // Naive scan — JSON-LD blocks are tagged with type="application/ld+json".
  const ldMatches = body.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const m of ldMatches) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of candidates) {
        const addr = readAddressFromJsonLdNode(node);
        if (addr) return addr;
      }
    } catch {
      /* ignore malformed blocks */
    }
  }
  return null;
}

type JsonLdNode = Record<string, unknown>;

function readAddressFromJsonLdNode(node: unknown): string | null {
  if (!node || typeof node !== "object") return null;
  const n = node as JsonLdNode;
  // Address can be a string OR a PostalAddress object.
  const addr = n.address;
  if (!addr) return null;
  if (typeof addr === "string") return addr.trim() || null;
  if (typeof addr === "object" && addr !== null) {
    const a = addr as JsonLdNode;
    const parts = [
      a.streetAddress,
      a.addressLocality,
      a.addressRegion,
      a.postalCode,
      a.addressCountry,
    ]
      .filter(
        (p): p is string => typeof p === "string" && p.trim().length > 0,
      )
      .map((p) => p.trim());
    if (parts.length > 0) return parts.join(", ");
  }
  return null;
}

function extractAddressFromMeta(body: string): string | null {
  if (!body) return null;
  // <meta itemprop="address" content="..."> — common on Google Maps.
  const m = body.match(
    /<meta\s+[^>]*itemprop=["']address["'][^>]*content=["']([^"']+)["']/i,
  );
  if (m) return decodeHtml(m[1]).trim() || null;
  return null;
}

function extractAddressFromTitleSuffix(
  body: string,
  placeName: string | null,
): string | null {
  if (!body) return null;
  // <title>Place Name · Address — Google Maps</title> is a common pattern.
  const t = body.match(/<title>([\s\S]*?)<\/title>/i);
  if (!t) return null;
  let title = decodeHtml(t[1]).replace(/\s+-\s*Google\s*Maps.*$/i, "").trim();
  if (placeName && title.toLowerCase().startsWith(placeName.toLowerCase())) {
    title = title.slice(placeName.length).trim();
    title = title.replace(/^[·•|—\-]\s*/, "").trim();
  }
  if (!title || title.length < 6) return null;
  return title;
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
