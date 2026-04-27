import {
  requireWorkspace,
  listVenues,
  listVenueBookingCounts,
} from "@/server/services";
import { VenuesTable } from "./_components/VenuesTable";

export default async function VenuesPage() {
  const workspace = await requireWorkspace();
  const [venues, bookingCounts] = await Promise.all([
    listVenues(workspace),
    listVenueBookingCounts(workspace),
  ]);

  return (
    <main className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <VenuesTable venues={venues} bookingCounts={bookingCounts} />
    </main>
  );
}
