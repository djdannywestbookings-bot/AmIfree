import Link from "next/link";
import { requireWorkspace } from "@/server/services";
import { VenueForm } from "../_components/VenueForm";

export default async function NewVenuePage() {
  await requireWorkspace();

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
      <VenueForm />
    </main>
  );
}
