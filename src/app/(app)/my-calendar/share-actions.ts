"use server";

import { revalidatePath } from "next/cache";
import {
  requireWorkspace,
  getCurrentMember,
  setMemberAvailabilityToken,
} from "@/server/services";

/**
 * Generate or rotate the share token for the current member.
 * Returns the new token so the client can show + copy it immediately.
 */
export type ShareTokenResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

export async function rotateShareTokenAction(): Promise<ShareTokenResult> {
  const workspace = await requireWorkspace();
  const member = await getCurrentMember(workspace);
  if (!member) {
    return { ok: false, error: "You're not a member of this workspace." };
  }
  try {
    const token = await setMemberAvailabilityToken(member.id);
    revalidatePath("/my-calendar");
    return { ok: true, token };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Couldn't rotate token.",
    };
  }
}
