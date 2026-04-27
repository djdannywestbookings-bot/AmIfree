import { notFound } from "next/navigation";
import {
  requireWorkspace,
  getBookingById,
  listVenues,
  listAssignableEmployees,
} from "@/server/services";
import { EditBookingForm } from "./_components/EditBookingForm";

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const workspace = await requireWorkspace();
  const { id } = await params;
  const [booking, venues, employees] = await Promise.all([
    getBookingById(workspace, id),
    listVenues(workspace),
    listAssignableEmployees(workspace),
  ]);

  if (!booking) {
    notFound();
  }

  return (
    <main className="max-w-screen-lg mx-auto p-4 sm:p-8 space-y-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Edit shift</h1>
        <a
          href="/agenda"
          className="text-xs text-neutral-500 underline hover:text-neutral-700"
        >
          ← back to schedule
        </a>
      </div>
      <EditBookingForm booking={booking} venues={venues} employees={employees} />
    </main>
  );
}
