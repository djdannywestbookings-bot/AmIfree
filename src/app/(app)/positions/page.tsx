import { redirect } from "next/navigation";
import {
  requireWorkspace,
  listPositions,
  listEmployeePositionsByEmployee,
  getCurrentMemberRole,
} from "@/server/services";
import { PositionsTable } from "./_components/PositionsTable";

export default async function PositionsPage() {
  const workspace = await requireWorkspace();
  const role = await getCurrentMemberRole(workspace);
  if (role !== "owner") {
    redirect("/calendar");
  }

  const [positions, byEmployee] = await Promise.all([
    listPositions(workspace),
    listEmployeePositionsByEmployee(workspace),
  ]);

  // Invert: position_id → count of employees holding it.
  const counts: Record<string, number> = {};
  for (const arr of byEmployee.values()) {
    for (const p of arr) {
      counts[p.id] = (counts[p.id] ?? 0) + 1;
    }
  }

  return (
    <main className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <PositionsTable positions={positions} employeeCounts={counts} />
    </main>
  );
}
