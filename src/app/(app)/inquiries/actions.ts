"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  confirmInquiryAsBooking,
  setInquiryStatus,
} from "@/server/services";

/**
 * Inquiry triage actions, posted from <form action={...}> on
 * /inquiries. Server-only flow — no client error handling, so we
 * return void and let any thrown error surface as the standard
 * Next.js server-action error page.
 */
const idSchema = z.object({ id: z.string().uuid() });

export async function confirmInquiryAction(
  formData: FormData,
): Promise<void> {
  const parsed = idSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) throw new Error("Invalid inquiry id.");
  await confirmInquiryAsBooking(parsed.data.id);
  revalidatePath("/inquiries");
  revalidatePath("/agenda");
  revalidatePath("/calendar");
}

export async function declineInquiryAction(
  formData: FormData,
): Promise<void> {
  const parsed = idSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) throw new Error("Invalid inquiry id.");
  await setInquiryStatus(parsed.data.id, "declined");
  revalidatePath("/inquiries");
}

export async function archiveInquiryAction(
  formData: FormData,
): Promise<void> {
  const parsed = idSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) throw new Error("Invalid inquiry id.");
  await setInquiryStatus(parsed.data.id, "archived");
  revalidatePath("/inquiries");
}
