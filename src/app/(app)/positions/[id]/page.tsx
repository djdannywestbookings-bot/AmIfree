import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  requireWorkspace,
  getPositionById,
  getCurrentMemberRole,
} from "@/server/services";
import { PositionForm } from "../_components/PositionForm";

export default async function EditPositionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const workspace = await requireWorkspace();
  const role = await getCurrentMemberRole(workspace);
  if (role !== "owner") {
    redirect("/calendar");
  }

  const { id } = await params;
  const position = await getPositionById(workspace, id);
  if (!position) notFound();

  return (
    <main className="max-w-screen-md mx-auto p-4 sm:p-8 space-y-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Edit position</h1>
        <Link
          href="/positions"
          className="text-xs text-neutral-500 underline hover:text-neutral-700"
        >
          ← back to positions
        </Link>
      </div>
      <PositionForm existing={position} />
    </main>
  );
}
