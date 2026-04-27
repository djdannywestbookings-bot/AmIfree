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

const createSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(60).optional(),
  role: z.enum(APP_ROLES).default("employee"),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().toLowerCase().optional(),
  name: z.string().trim().min(1).max(200).optional(),
  phone: z.string().trim().max(60).optional(),
  role: z.enum(APP_ROLES).optional(),
  status: z.enum(MEMBER_STATUSES).optional(),
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
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid employee.",
    };
  }

  try {
    await createEmployee(workspace, {
      email: parsed.data.email,
      name: parsed.data.name,
      phone: parsed.data.phone && parsed.data.phone.length > 0 ? parsed.data.phone : null,
      role: parsed.data.role,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
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
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
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
