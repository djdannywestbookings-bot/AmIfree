import { redirect } from "next/navigation";
import {
  requireWorkspace,
  listEmployees,
  getCurrentMemberRole,
  listEmployeePositionsByEmployee,
} from "@/server/services";
import { EmployeesTable } from "./_components/EmployeesTable";

export default async function EmployeesPage() {
  const workspace = await requireWorkspace();
  const role = await getCurrentMemberRole(workspace);
  if (role !== "owner") {
    // Non-owners shouldn't see the team management page in Phase 38.
    // (Phase 39+ may add a read-only view for managers.)
    redirect("/calendar");
  }

  const [employees, positionsByEmployee] = await Promise.all([
    listEmployees(workspace),
    listEmployeePositionsByEmployee(workspace),
  ]);

  // Convert Map<id, PositionRow[]> to a plain object for the client.
  const positionsByEmployeeObj: Record<
    string,
    { id: string; name: string; color: string | null }[]
  > = {};
  for (const [empId, positions] of positionsByEmployee.entries()) {
    positionsByEmployeeObj[empId] = positions.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
    }));
  }

  return (
    <main className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <EmployeesTable
        employees={employees}
        positionsByEmployee={positionsByEmployeeObj}
      />
    </main>
  );
}
