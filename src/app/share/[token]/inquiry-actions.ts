"use server";

import { revalidatePath } from "next/cache";
import {
  getShareTargetByToken,
  submitInquiry,
} from "@/server/services";
import { inquiryCreateSchema } from "@/modules/inquiries";

/**
 * Submit an inquiry from /share/[token]. Public surface — no auth.
 * Token IS the access control: it tells us which member is the
 * intended recipient. We re-resolve the member here rather than
 * trusting a posted member_id.
 */
export type SubmitInquiryResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitInquiryAction(
  formData: FormData,
): Promise<SubmitInquiryResult> {
  const token = (formData.get("token") || "").toString().trim();
  if (!token) {
    return { ok: false, error: "Share link is missing." };
  }
  const target = await getShareTargetByToken(token);
  if (!target) {
    return { ok: false, error: "This share link is no longer active." };
  }

  const parsed = inquiryCreateSchema.safeParse({
    target_member_id: target.member.id,
    inquirer_name: formData.get("inquirer_name") || "",
    inquirer_email: formData.get("inquirer_email") || "",
    inquirer_phone: formData.get("inquirer_phone") || undefined,
    requested_date: formData.get("requested_date") || undefined,
    requested_time: formData.get("requested_time") || undefined,
    subject: formData.get("subject") || undefined,
    message: formData.get("message") || "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the form values.",
    };
  }

  try {
    await submitInquiry(parsed.data);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Couldn't send the inquiry.",
    };
  }

  // Revalidate any cached path that surfaces the inquiry count.
  revalidatePath("/inquiries");
  revalidatePath("/calendar");
  return { ok: true };
}
