import { notFound } from "next/navigation";
import {
  requireWorkspace,
  getBookingById,
  listVenues,
  listAssignableEmployees,
  getCurrentMemberId,
} from "@/server/services";
import { EditBookingForm } from "../_components/EditBookingForm";

/**
 * /agenda/[id]/edit — explicit edit mode.
 *
 * The plain /agenda/[id] route shows a read-only detail view; users
 * have to click "Edit shift" there to land here. After saving, the
 * action redirects back to the detail view.
 */
export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const workspace = await requireWorkspace();
  const { id } = await params;
  const [booking, venues, employees, currentMemberId] = await Promise.all([
    getBookingById(workspace, id),
    listVenues(workspace),
    listAssignableEmployees(workspace),
    getCurrentMemberId(workspace),
  ]);

  if (!booking) {
    notFound();
  }

  return (
    <main className="max-w-screen-lg mx-auto p-4 sm:p-8 space-y-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Edit shift</h1>
        <a
          href={`/agenda/${id}`}
          className="text-xs text-slate-500 underline hover:text-slate-700"
        >
          ← back to shift
        </a>
      </div>
      <EditBookingForm
        booking={booking}
        venues={venues}
        employees={employees}
        currentMemberId={currentMemberId}
      />
    </main>
  );
}
