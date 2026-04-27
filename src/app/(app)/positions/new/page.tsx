import Link from "next/link";
import { redirect } from "next/navigation";
import { requireWorkspace, getCurrentMemberRole } from "@/server/services";
import { PositionForm } from "../_components/PositionForm";

export default async function NewPositionPage() {
  const workspace = await requireWorkspace();
  const role = await getCurrentMemberRole(workspace);
  if (role !== "owner") {
    redirect("/calendar");
  }

  return (
    <main className="max-w-screen-md mx-auto p-4 sm:p-8 space-y-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Add position</h1>
        <Link
          href="/positions"
          className="text-xs text-neutral-500 underline hover:text-neutral-700"
        >
          ← back to positions
        </Link>
      </div>
      <p className="text-sm text-neutral-600 max-w-2xl">
        Create job titles your employees can hold. They show up as colored
        chips on each employee&apos;s row and (later) filter the assignee
        dropdown so you can pick the right person for the right gig.
      </p>
      <PositionForm />
    </main>
  );
}
