"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  requireWorkspace,
  getCurrentMemberId,
  clockIn,
  clockOut,
} from "@/server/services";

export type PunchResult =
  | { ok: true }
  | { ok: false; error: string };

const clockInSchema = z.object({
  booking_id: z.string().uuid().optional(),
});

const clockOutSchema = z.object({
  punch_id: z.string().uuid(),
});

export async function clockInAction(
  formData: FormData,
): Promise<PunchResult> {
  const workspace = await requireWorkspace();
  const memberId = await getCurrentMemberId(workspace);
  if (!memberId) {
    return { ok: false, error: "You're not a member of this workspace." };
  }

  const parsed = clockInSchema.safeParse({
    booking_id: formData.get("booking_id") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid input." };
  }

  try {
    await clockIn(workspace, memberId, parsed.data.booking_id ?? null);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Clock in failed.",
    };
  }
  revalidatePath("/timesheet");
  revalidatePath("/agenda");
  return { ok: true };
}

export async function clockOutAction(
  formData: FormData,
): Promise<PunchResult> {
  const workspace = await requireWorkspace();
  const parsed = clockOutSchema.safeParse({
    punch_id: formData.get("punch_id"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid punch id." };
  }
  try {
    await clockOut(workspace, parsed.data.punch_id);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Clock out failed.",
    };
  }
  revalidatePath("/timesheet");
  revalidatePath("/agenda");
  return { ok: true };
}
