import { redirect } from "next/navigation";
import {
  requireWorkspace,
  listEmployees,
  getCurrentMemberRole,
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

  const employees = await listEmployees(workspace);

  return (
    <main className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <EmployeesTable employees={employees} />
    </main>
  );
}
