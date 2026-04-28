import { z } from "zod";

/**
 * Inquiry types — public-facing "looking to book you" message posted
 * via /share/[token]. Mirrors the public.inquiries table from
 * migration 0018.
 */

export const INQUIRY_STATUSES = [
  "pending",
  "confirmed",
  "declined",
  "archived",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const inquiryRowSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  target_member_id: z.string().uuid(),
  inquirer_name: z.string(),
  inquirer_email: z.string(),
  inquirer_phone: z.string().nullable(),
  requested_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  requested_time: z.string().nullable(),
  subject: z.string().nullable(),
  message: z.string(),
  status: z.enum(INQUIRY_STATUSES),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export type InquiryRow = z.infer<typeof inquiryRowSchema>;

export const inquiryCreateSchema = z.object({
  target_member_id: z.string().uuid(),
  inquirer_name: z.string().trim().min(1, "Your name is required.").max(120),
  inquirer_email: z.string().trim().toLowerCase().email("Enter a valid email."),
  inquirer_phone: z.string().trim().max(40).optional(),
  requested_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date.")
    .optional(),
  requested_time: z.string().trim().max(60).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Tell them what you're looking for.").max(4000),
});

export type InquiryCreateInput = z.infer<typeof inquiryCreateSchema>;
