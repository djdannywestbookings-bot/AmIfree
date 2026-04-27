import { requireWorkspace, listVenues } from "@/server/services";
import { VenueForm } from "./_components/VenueForm";
import { deleteVenueAction } from "./actions";

export default async function VenuesPage() {
  const workspace = await requireWorkspace();
  const venues = await listVenues(workspace);

  return (
    <main className="max-w-screen-lg mx-auto p-4 sm:p-8 space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Venues</h1>
        <p className="text-xs text-neutral-500">
          <strong>{workspace.name}</strong> · saved venues for quick scheduling
        </p>
      </div>

      <p className="text-sm text-neutral-600 max-w-2xl">
        Create venue profiles you book at often. They show up as a dropdown
        on every shift, get a colored pill on the calendar, and keep their
        address with them so you don&apos;t have to retype it.
      </p>

      <VenueForm />

      {venues.length === 0 ? (
        <div className="border border-dashed border-neutral-300 rounded-md p-8 text-center text-sm text-neutral-500">
          No venues yet. Create one above to get started.
        </div>
      ) : (
        <ul className="space-y-2">
          {venues.map((v) => (
            <li
              key={v.id}
              className="border border-neutral-200 rounded-md p-4 bg-white flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-4 h-4 rounded-full border border-neutral-200 shrink-0"
                  style={{ backgroundColor: v.color ?? "#e5e7eb" }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="font-medium truncate">{v.name}</div>
                  {v.address && (
                    <div className="text-xs text-neutral-500 truncate">
                      {v.address}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/venues/${v.id}`}
                  className="text-xs rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-50"
                >
                  Edit
                </a>
                <form action={deleteVenueAction}>
                  <input type="hidden" name="id" value={v.id} />
                  <button
                    type="submit"
                    className="text-xs rounded border border-red-200 text-red-700 px-2 py-1 hover:bg-red-50"
                    aria-label={`Delete ${v.name}`}
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
