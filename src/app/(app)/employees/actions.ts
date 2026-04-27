"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  requireWorkspace,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getCurrentMemberRole,
  setEmployeePositions,
} from "@/server/services";
import { APP_ROLES } from "@/server/policies/roles";
import { MEMBER_STATUSES } from "@/modules/auth";

export type EmployeeResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireOwner() {
  const workspace = await requireWorkspace();
  const role = await getCurrentMemberRole(workspace);
  if (role !== "owner") {
    throw new Error("Only the workspace owner can manage employees.");
  }
  return workspace;
}

// Coerces "12.50" → 1250 (USD-string to cents). Empty/missing → undefined.
const payRateUsdToCents = z
  .string()
  .optional()
  .transform((v) => {
    if (!v || v.trim().length === 0) return undefined;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) return undefined;
    return Math.round(n * 100);
  })
  .pipe(
    z
      .number()
      .int()
      .min(0)
      .max(99_999_900)
      .optional(),
  );

const createSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(60).optional(),
  role: z.enum(APP_ROLES).default("employee"),
  default_pay_rate_cents: payRateUsdToCents,
});

const updateSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().toLowerCase().optional(),
  name: z.string().trim().min(1).max(200).optional(),
  phone: z.string().trim().max(60).optional(),
  role: z.enum(APP_ROLES).optional(),
  status: z.enum(MEMBER_STATUSES).optional(),
  default_pay_rate_cents: payRateUsdToCents,
});

const deleteSchema = z.object({ id: z.string().uuid() });

function getOrUndef(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return v ? String(v) : undefined;
}

export async function createEmployeeAction(
  formData: FormData,
): Promise<EmployeeResult> {
  let workspace;
  try {
    workspace = await requireOwner();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Forbidden" };
  }

  const parsed = createSchema.safeParse({
    email: getOrUndef(formData, "email"),
    name: getOrUndef(formData, "name"),
    phone: getOrUndef(formData, "phone"),
    role: getOrUndef(formData, "role") ?? "employee",
    default_pay_rate_cents: getOrUndef(formData, "default_pay_rate_cents"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid employee.",
    };
  }

  let createdId: string | null = null;
  try {
    const created = await createEmployee(workspace, {
      email: parsed.data.email,
      name: parsed.data.name,
      phone: parsed.data.phone && parsed.data.phone.length > 0 ? parsed.data.phone : null,
      role: parsed.data.role,
      default_pay_rate_cents: parsed.data.default_pay_rate_cents,
    });
    createdId = created.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }

  // Phase 39 — assign positions to the new row.
  const positionIds = formData.getAll("position_ids").map(String);
  if (createdId && positionIds.length > 0) {
    try {
      await setEmployeePositions(createdId, positionIds);
    } catch (err) {
      // Non-fatal: the employee exists, the position assignment failed.
      // User can fix it from the edit page.
      console.error("setEmployeePositions failed", err);
    }
  }

  revalidatePath("/employees");
  return { ok: true };
}

export async function updateEmployeeAction(
  formData: FormData,
): Promise<EmployeeResult> {
  let workspace;
  try {
    workspace = await requireOwner();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Forbidden" };
  }

  const parsed = updateSchema.safeParse({
    id: getOrUndef(formData, "id"),
    email: getOrUndef(formData, "email"),
    name: getOrUndef(formData, "name"),
    phone: getOrUndef(formData, "phone"),
    role: getOrUndef(formData, "role"),
    status: getOrUndef(formData, "status"),
    default_pay_rate_cents: getOrUndef(formData, "default_pay_rate_cents"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid update.",
    };
  }

  try {
    await updateEmployee(workspace, parsed.data.id, {
      email: parsed.data.email,
      name: parsed.data.name,
      phone: parsed.data.phone !== undefined ? (parsed.data.phone.length > 0 ? parsed.data.phone : null) : undefined,
      role: parsed.data.role,
      status: parsed.data.status,
      default_pay_rate_cents: parsed.data.default_pay_rate_cents,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }

  // Phase 39 — sync positions for this employee. Empty list = clear all.
  const positionIds = formData.getAll("position_ids").map(String);
  try {
    await setEmployeePositions(parsed.data.id, positionIds);
  } catch (err) {
    console.error("setEmployeePositions failed", err);
  }

  revalidatePath("/employees");
  redirect("/employees");
}

export async function deleteEmployeeAction(formData: FormData): Promise<void> {
  const workspace = await requireOwner();
  const parsed = deleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) throw new Error("Invalid id.");
  await deleteEmployee(workspace, parsed.data.id);
  revalidatePath("/employees");
}
