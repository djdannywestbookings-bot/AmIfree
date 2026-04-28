import Link from "next/link";
import { redirect } from "next/navigation";
import {
  requireWorkspace,
  getCurrentMemberRole,
  listPositions,
  listVenues,
} from "@/server/services";
import { EmployeeForm } from "../_components/EmployeeForm";

export default async function NewEmployeePage() {
  const workspace = await requireWorkspace();
  const role = await getCurrentMemberRole(workspace);
  if (role !== "owner") {
    redirect("/calendar");
  }

  const [positions, venues] = await Promise.all([
    listPositions(workspace),
    listVenues(workspace),
  ]);

  return (
    <main className="max-w-screen-md mx-auto p-4 sm:p-8 space-y-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Add employee</h1>
        <Link
          href="/employees"
          className="text-xs text-neutral-500 underline hover:text-neutral-700"
        >
          ← back to employees
        </Link>
      </div>
      <p className="text-sm text-neutral-600 max-w-2xl">
        Invite a team member by email. They&apos;ll show up as Pending in
        your roster until they sign in for the first time.
      </p>
      <EmployeeForm allPositions={positions} allVenues={venues} />
    </main>
  );
}
