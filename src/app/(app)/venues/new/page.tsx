import Link from "next/link";
import { requireWorkspace } from "@/server/services";
import { VenueForm } from "../_components/VenueForm";

/**
 * /venues/new — create a new venue.
 *
 * Web Share Target hook: sharing a Google Maps page from a native or
 * browser share sheet lands here at `/venues/new?import_url=<url>`
 * (per the share_target config in manifest.webmanifest). The form
 * auto-runs the importer on mount when initialImportUrl is set.
 *
 * The Android share sheet sends the page URL as `text`; iOS sends it
 * as `url`; some browsers send a title separately. The manifest maps
 * both `text` and `url` to the same query key.
 */
export default async function NewVenuePage({
  searchParams,
}: {
  searchParams: Promise<{ import_url?: string | string[] }>;
}) {
  await requireWorkspace();
  const params = await searchParams;
  const raw = params.import_url;
  const initialImportUrl = Array.isArray(raw) ? raw[0] : raw;

  return (
    <main className="max-w-screen-md mx-auto p-4 sm:p-8 space-y-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Add venue</h1>
        <Link
          href="/venues"
          className="text-xs text-neutral-500 underline hover:text-neutral-700"
        >
          ← back to venues
        </Link>
      </div>
      <p className="text-sm text-neutral-600 max-w-2xl">
        Save a venue you book at often so its name, address, and color follow
        every shift you create there.
      </p>
      <VenueForm initialImportUrl={initialImportUrl} />
    </main>
  );
}
