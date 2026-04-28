"use server";

import { z } from "zod";
import {
  extractVenueFromMapsUrl,
  type VenueImportResult,
} from "@/server/services";
import { requireWorkspace } from "@/server/services";

/**
 * Server action: parse a pasted Google Maps share URL into a venue
 * preview. Doesn't write anything — the form handler still calls
 * createVenueAction once the user confirms.
 */
const schema = z.object({
  url: z.string().min(1, "Paste a Google Maps URL first.").max(2000),
});

export async function importVenueFromUrlAction(
  formData: FormData,
): Promise<VenueImportResult> {
  // Auth gate — anyone hitting this action must be a real signed-in
  // workspace member, since we're proxying outbound HTTPS via our
  // server. requireWorkspace throws if not.
  await requireWorkspace();

  const parsed = schema.safeParse({ url: formData.get("url") });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid URL.",
    };
  }
  return extractVenueFromMapsUrl(parsed.data.url);
}
