"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  requireWorkspace,
  createPosition,
  updatePosition,
  deletePosition,
  getCurrentMemberRole,
} from "@/server/services";

export type PositionResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireOwner() {
  const workspace = await requireWorkspace();
  const role = await getCurrentMemberRole(workspace);
  if (role !== "owner") {
    throw new Error("Only the workspace owner can manage positions.");
  }
  return workspace;
}

const colorRegex = /^#[0-9A-Fa-f]{6}$/;

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  color: z.string().regex(colorRegex).optional(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  color: z.string().regex(colorRegex).optional(),
});

const deleteSchema = z.object({ id: z.string().uuid() });

function getOrUndef(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return v ? String(v) : undefined;
}

export async function createPositionAction(
  formData: FormData,
): Promise<PositionResult> {
  let workspace;
  try {
    workspace = await requireOwner();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Forbidden" };
  }

  const parsed = createSchema.safeParse({
    name: getOrUndef(formData, "name"),
    color: getOrUndef(formData, "_position_color"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid position.",
    };
  }
  try {
    await createPosition(workspace, {
      name: parsed.data.name,
      color: parsed.data.color ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
  revalidatePath("/positions");
  revalidatePath("/employees");
  return { ok: true };
}

export async function updatePositionAction(
  formData: FormData,
): Promise<PositionResult> {
  let workspace;
  try {
    workspace = await requireOwner();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Forbidden" };
  }

  const parsed = updateSchema.safeParse({
    id: getOrUndef(formData, "id"),
    name: getOrUndef(formData, "name"),
    color: getOrUndef(formData, "_position_color"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid update.",
    };
  }
  try {
    await updatePosition(workspace, parsed.data.id, {
      name: parsed.data.name,
      color: parsed.data.color ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
  revalidatePath("/positions");
  revalidatePath("/employees");
  redirect("/positions");
}

export async function deletePositionAction(
  formData: FormData,
): Promise<void> {
  const workspace = await requireOwner();
  const parsed = deleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) throw new Error("Invalid id.");
  await deletePosition(workspace, parsed.data.id);
  revalidatePath("/positions");
  revalidatePath("/employees");
}
