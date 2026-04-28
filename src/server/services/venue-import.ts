import "server-only";

import { getOpenAIClient } from "@/lib/openai/client";

/**
 * Best-effort venue importer for pasted Google Maps URLs.
 *
 * Two execution paths:
 *
 *   1. Direct parse — works when the URL or HTML exposes the place
 *      name in `/maps/place/<encoded>/` or address in JSON-LD /
 *      meta itemprop=address. Cheap, no API calls.
 *
 *   2. OpenAI fallback — when path 1 misses (which happens often for
 *      `maps.app.goo.gl` short links because they redirect via a
 *      Firebase Dynamic Links bouncer page, not a direct 302 to the
 *      place URL), we pass the HTML body to a small OpenAI extraction
 *      with a JSON-schema response. This is the only reliable path
 *      for those links and it also pulls the phone number, which the
 *      direct parser doesn't try to surface.
 *
 * Returns { ok: false, error } on any failure so the venue form can
 * tell the user to fill manually instead of silently swallowing.
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

const MAX_HTML_FOR_OPENAI = 30_000;

export type VenueImportResult =
  | {
      ok: true;
      name: string;
      address: string | null;
      phone: string | null;
      sourceUrl: string;
    }
  | { ok: false; error: string };

export async function extractVenueFromMapsUrl(
  rawUrl: string,
): Promise<VenueImportResult> {
  const trimmed = rawUrl.trim();
  if (!trimmed) return { ok: false, error: "Paste a Google Maps URL first." };

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    return { ok: false, error: "That doesn't look like a URL." };
  }
  if (!ALLOWED_HOSTS.has(parsedUrl.hostname)) {
    return {
      ok: false,
      error: "Only Google Maps URLs are supported right now.",
    };
  }

  // Fetch with redirect follow + 8-second timeout.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
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
          ? "Google Maps took too long to respond. Try again."
          : "Couldn't reach Google Maps. Check the link.",
    };
  }
  clearTimeout(timeoutId);

  const finalUrl = response.url;
  let body = "";
  try {
    body = await response.text();
  } catch {
    /* empty body is fine — direct URL parse may still hit */
  }

  // Path 1 — direct parse of URL + HTML metadata.
  const directName = extractPlaceNameFromUrl(finalUrl);
  const directAddress =
    extractAddressFromJsonLd(body) ??
    extractAddressFromMeta(body) ??
    null;

  if (directName && directAddress) {
    return {
      ok: true,
      name: directName,
      address: directAddress,
      phone: extractPhoneFromBody(body),
      sourceUrl: finalUrl,
    };
  }

  // Path 2 — OpenAI fallback. Required for Firebase short links since
  // their bouncer HTML doesn't expose the place URL through any of
  // the standard meta tags.
  if (process.env.OPENAI_API_KEY) {
    try {
      const ai = await extractViaOpenAI(body, finalUrl);
      if (ai && (ai.name || ai.address)) {
        return {
          ok: true,
          name: ai.name ?? directName ?? "",
          address: ai.address ?? directAddress ?? null,
          phone: ai.phone ?? null,
          sourceUrl: finalUrl,
        };
      }
    } catch (err) {
      console.error("venue-import OpenAI extract failed", err);
      /* fall through to direct partial result */
    }
  }

  // Neither path landed both fields — return partials if we have any.
  if (directName || directAddress) {
    return {
      ok: true,
      name: directName ?? "",
      address: directAddress,
      phone: extractPhoneFromBody(body),
      sourceUrl: finalUrl,
    };
  }

  return {
    ok: false,
    error: "Couldn't read this Google Maps link. Fill the venue manually.",
  };
}

/* -------------------------------------------------------------------------- *
 * Direct-parse helpers
 * -------------------------------------------------------------------------- */

function extractPlaceNameFromUrl(url: string): string | null {
  const match = url.match(/\/maps\/place\/([^/?#]+)/i);
  if (!match) return null;
  try {
    const decoded = decodeURIComponent(match[1].replace(/\+/g, " "));
    return decoded.trim() || null;
  } catch {
    return null;
  }
}

function extractAddressFromJsonLd(body: string): string | null {
  if (!body) return null;
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
  const m = body.match(
    /<meta\s+[^>]*itemprop=["']address["'][^>]*content=["']([^"']+)["']/i,
  );
  if (m) return decodeHtml(m[1]).trim() || null;
  return null;
}

function extractPhoneFromBody(body: string): string | null {
  if (!body) return null;
  // tel: links are reliable when present.
  const t = body.match(/href=["']tel:([+\d\s().-]+)["']/i);
  if (t) return decodeHtml(t[1]).trim();
  return null;
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

/* -------------------------------------------------------------------------- *
 * OpenAI fallback
 * -------------------------------------------------------------------------- */

const VENUE_EXTRACT_SYSTEM_PROMPT = [
  "You receive raw HTML from a Google Maps page or a Firebase Dynamic Links",
  "bouncer that redirects to one. Extract the venue's name, full street",
  "address (street, city, state, zip, country if available), and phone",
  "number if you can find one.",
  "",
  "Rules:",
  "- Return ONLY the requested JSON. No prose.",
  "- If a field isn't clearly present in the HTML, return null for it.",
  "- The address should be a single line, joined by commas.",
  "- The phone should preserve the original formatting where reasonable",
  "  (e.g. '(817) 740-0026'). If only a digits-only string is present,",
  "  return that.",
  "- Do not invent fields. If the HTML is just a JS bouncer with no",
  "  visible place data, return all-null values.",
].join(" ");

async function extractViaOpenAI(
  body: string,
  finalUrl: string,
): Promise<{
  name: string | null;
  address: string | null;
  phone: string | null;
} | null> {
  if (!body) return null;
  const client = getOpenAIClient();
  const truncated = body.length > MAX_HTML_FOR_OPENAI
    ? body.slice(0, MAX_HTML_FOR_OPENAI) + "\n<!-- truncated -->"
    : body;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: VENUE_EXTRACT_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          `Final URL after redirects: ${finalUrl}`,
          "",
          "HTML body:",
          "```html",
          truncated,
          "```",
        ].join("\n"),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "VenueImport",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: ["string", "null"] },
            address: { type: ["string", "null"] },
            phone: { type: ["string", "null"] },
          },
          required: ["name", "address", "phone"],
        },
      },
    },
    temperature: 0,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      name: string | null;
      address: string | null;
      phone: string | null;
    };
    return parsed;
  } catch {
    return null;
  }
}
