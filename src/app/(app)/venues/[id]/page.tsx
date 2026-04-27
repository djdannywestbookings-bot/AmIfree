import { notFound } from "next/navigation";
import { requireWorkspace, getVenueById } from "@/server/services";
import { VenueForm } from "../_components/VenueForm";

export default async function EditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const workspace = await requireWorkspace();
  const { id } = await params;
  const venue = await getVenueById(workspace, id);
  if (!venue) notFound();

  return (
    <main className="max-w-screen-lg mx-auto p-4 sm:p-8 space-y-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Edit venue</h1>
        <a
          href="/venues"
          className="text-xs text-neutral-500 underline hover:text-neutral-700"
        >
          ← back to venues
        </a>
      </div>
      <VenueForm existing={venue} />
    </main>
  );
}
