"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  requireWorkspace,
  createVenue,
  updateVenue,
  deleteVenue,
} from "@/server/services";

export type VenueResult = { ok: true } | { ok: false; error: string };

const colorRegex = /^#[0-9A-Fa-f]{6}$/;

const createSchema = z.object({
  name: z.string().trim().min(1, "Venue name is required").max(200),
  address: z.string().max(500).optional(),
  color: z.string().regex(colorRegex).optional(),
  contact_name: z.string().trim().max(200).optional(),
  contact_phone: z.string().trim().max(60).optional(),
  notes: z.string().max(5000).optional(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Venue name is required").max(200),
  address: z.string().max(500).optional(),
  color: z.string().regex(colorRegex).optional(),
  contact_name: z.string().trim().max(200).optional(),
  contact_phone: z.string().trim().max(60).optional(),
  notes: z.string().max(5000).optional(),
});

const deleteSchema = z.object({ id: z.string().uuid() });

function getOrUndef(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return v ? String(v) : undefined;
}

export async function createVenueAction(
  formData: FormData,
): Promise<VenueResult> {
  const workspace = await requireWorkspace();

  const parsed = createSchema.safeParse({
    name: getOrUndef(formData, "name"),
    address: getOrUndef(formData, "address"),
    color: getOrUndef(formData, "_venue_color"),
    contact_name: getOrUndef(formData, "contact_name"),
    contact_phone: getOrUndef(formData, "contact_phone"),
    notes: getOrUndef(formData, "notes"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid venue.",
    };
  }

  try {
    await createVenue(workspace, {
      name: parsed.data.name,
      address: parsed.data.address && parsed.data.address.length > 0 ? parsed.data.address : null,
      color: parsed.data.color ?? null,
      contact_name: parsed.data.contact_name && parsed.data.contact_name.length > 0 ? parsed.data.contact_name : null,
      contact_phone: parsed.data.contact_phone && parsed.data.contact_phone.length > 0 ? parsed.data.contact_phone : null,
      notes: parsed.data.notes && parsed.data.notes.length > 0 ? parsed.data.notes : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }

  revalidatePath("/venues");
  revalidatePath("/agenda");
  revalidatePath("/calendar");
  revalidatePath("/my-calendar");
  return { ok: true };
}

export async function updateVenueAction(
  formData: FormData,
): Promise<VenueResult> {
  const workspace = await requireWorkspace();

  const parsed = updateSchema.safeParse({
    id: getOrUndef(formData, "id"),
    name: getOrUndef(formData, "name"),
    address: getOrUndef(formData, "address"),
    color: getOrUndef(formData, "_venue_color"),
    contact_name: getOrUndef(formData, "contact_name"),
    contact_phone: getOrUndef(formData, "contact_phone"),
    notes: getOrUndef(formData, "notes"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid venue.",
    };
  }

  try {
    await updateVenue(workspace, parsed.data.id, {
      name: parsed.data.name,
      address: parsed.data.address && parsed.data.address.length > 0 ? parsed.data.address : null,
      color: parsed.data.color ?? null,
      contact_name: parsed.data.contact_name && parsed.data.contact_name.length > 0 ? parsed.data.contact_name : null,
      contact_phone: parsed.data.contact_phone && parsed.data.contact_phone.length > 0 ? parsed.data.contact_phone : null,
      notes: parsed.data.notes && parsed.data.notes.length > 0 ? parsed.data.notes : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }

  revalidatePath("/venues");
  revalidatePath("/agenda");
  revalidatePath("/calendar");
  revalidatePath("/my-calendar");
  redirect("/venues");
}

export async function deleteVenueAction(formData: FormData): Promise<void> {
  const workspace = await requireWorkspace();
  const parsed = deleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    throw new Error("Invalid venue id.");
  }

  await deleteVenue(workspace, parsed.data.id);

  revalidatePath("/venues");
  revalidatePath("/agenda");
  revalidatePath("/calendar");
  revalidatePath("/my-calendar");
}
