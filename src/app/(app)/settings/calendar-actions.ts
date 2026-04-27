"use server";

import { revalidatePath } from "next/cache";
import {
  requireWorkspace,
  rotateCalendarToken,
} from "@/server/services";

/**
 * Rotate the workspace's iCal token. The old URL stops working
 * immediately; the user has to re-subscribe in their calendar app
 * with the new URL.
 */
export async function rotateCalendarTokenAction(): Promise<{
  ok: true;
  newToken: string;
} | { ok: false; error: string }> {
  const workspace = await requireWorkspace();
  try {
    const newToken = await rotateCalendarToken(workspace.id);
    revalidatePath("/settings");
    return { ok: true, newToken };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}
