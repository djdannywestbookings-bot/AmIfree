import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  inquiryRowSchema,
  type InquiryRow,
  type InquiryCreateInput,
} from "@/modules/inquiries";
import {
  workspaceMemberRowSchema,
  type WorkspaceMemberRow,
  workspaceRowSchema,
  type WorkspaceRow,
} from "@/modules/auth";
import { createBooking } from "./bookings";

/**
 * Inquiries service.
 *
 * Public surface (anon allowed): submitInquiry. Authenticated:
 * listPendingInquiriesForMember, confirmInquiry, declineInquiry,
 * countPendingInquiriesForMember.
 */

export async function submitInquiry(
  input: InquiryCreateInput,
): Promise<InquiryRow> {
  const admin = createAdminClient();

  // Validate the target member exists and is shareable.
  const { data: memRow } = await admin
    .from("workspace_members")
    .select("*")
    .eq("id", input.target_member_id)
    .neq("status", "disabled")
    .maybeSingle();
  if (!memRow) throw new Error("This share link is not active.");
  const member = workspaceMemberRowSchema.parse(memRow);
  if (!member.availability_token) {
    throw new Error("This share link is not active.");
  }

  const { data, error } = await admin
    .from("inquiries")
    .insert({
      workspace_id: member.workspace_id,
      target_member_id: member.id,
      inquirer_name: input.inquirer_name,
      inquirer_email: input.inquirer_email,
      inquirer_phone: input.inquirer_phone ?? null,
      requested_date: input.requested_date ?? null,
      requested_time: input.requested_time ?? null,
      subject: input.subject ?? null,
      message: input.message,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return inquiryRowSchema.parse(data);
}

/**
 * List inquiries assigned to the current authenticated user
 * (where target_member.user_id = auth user). Optional status filter.
 */
export async function listInquiriesForCurrentMember(
  workspace: Pick<WorkspaceRow, "id">,
  options?: { status?: "pending" | "confirmed" | "declined" | "archived" },
): Promise<InquiryRow[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Find the member id for the current user in this workspace.
  const { data: memRow } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!memRow) return [];

  const admin = createAdminClient();
  let query = admin
    .from("inquiries")
    .select("*")
    .eq("target_member_id", (memRow as { id: string }).id)
    .order("created_at", { ascending: false });
  if (options?.status) query = query.eq("status", options.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => inquiryRowSchema.parse(row));
}

export async function countPendingInquiriesForCurrentMember(
  workspace: Pick<WorkspaceRow, "id">,
): Promise<number> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: memRow } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!memRow) return 0;

  const admin = createAdminClient();
  const { count } = await admin
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("target_member_id", (memRow as { id: string }).id)
    .eq("status", "pending");
  return count ?? 0;
}

export async function getInquiryById(
  inquiryId: string,
): Promise<{
  inquiry: InquiryRow;
  member: WorkspaceMemberRow;
  workspace: WorkspaceRow;
} | null> {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("inquiries")
    .select("*")
    .eq("id", inquiryId)
    .maybeSingle();
  if (!row) return null;
  const inquiry = inquiryRowSchema.parse(row);

  const { data: memRow } = await admin
    .from("workspace_members")
    .select("*")
    .eq("id", inquiry.target_member_id)
    .maybeSingle();
  if (!memRow) return null;
  const member = workspaceMemberRowSchema.parse(memRow);

  const { data: wsRow } = await admin
    .from("workspaces")
    .select("*")
    .eq("id", inquiry.workspace_id)
    .maybeSingle();
  if (!wsRow) return null;
  const workspace = workspaceRowSchema.parse(wsRow);
  return { inquiry, member, workspace };
}

export async function setInquiryStatus(
  inquiryId: string,
  status: "pending" | "confirmed" | "declined" | "archived",
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("inquiries")
    .update({ status })
    .eq("id", inquiryId);
  if (error) throw new Error(error.message);
}

/**
 * Confirm an inquiry by creating a real booking on the owner's
 * schedule. Combines the inquiry's date + free-form time into a
 * placeholder booking; owner can edit details after.
 */
export async function confirmInquiryAsBooking(
  inquiryId: string,
): Promise<void> {
  const target = await getInquiryById(inquiryId);
  if (!target) throw new Error("Inquiry not found.");
  const { inquiry, member, workspace } = target;

  // Build a title from the subject + inquirer.
  const subject = inquiry.subject?.trim();
  const title = subject && subject.length > 0
    ? `${subject} · ${inquiry.inquirer_name}`
    : `Inquiry from ${inquiry.inquirer_name}`;

  // Anchor to noon local on the requested date so the booking shows
  // up clearly. If no date was given, leave start_at null and use
  // service_day if we have nothing else.
  let startIso: string | null = null;
  if (inquiry.requested_date) {
    const m = inquiry.requested_date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const d = new Date(
        Number(m[1]),
        Number(m[2]) - 1,
        Number(m[3]),
        12,
        0,
        0,
        0,
      );
      startIso = d.toISOString();
    }
  }

  await createBooking(workspace, {
    title,
    status: "hold", // not confirmed yet — owner edits to lock in
    start_at: startIso,
    end_at: null,
    all_day: false,
    venue_id: null,
    assigned_employee_id: member.id,
    location: null,
    pay: null,
    notes: [
      inquiry.subject ? `Subject: ${inquiry.subject}` : null,
      `Contact: ${inquiry.inquirer_name} · ${inquiry.inquirer_email}${
        inquiry.inquirer_phone ? ` · ${inquiry.inquirer_phone}` : ""
      }`,
      inquiry.requested_time
        ? `Requested time: ${inquiry.requested_time}`
        : null,
      "",
      inquiry.message,
    ]
      .filter((s): s is string => s !== null)
      .join("\n"),
  });

  await setInquiryStatus(inquiryId, "confirmed");
}
