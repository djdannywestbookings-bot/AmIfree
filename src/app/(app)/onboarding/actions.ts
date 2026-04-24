"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentActor } from "@/server/policies";
import { createWorkspace, getCurrentWorkspace } from "@/server/services";
import { workspaceCreateInputSchema } from "@/modules/auth";

export type OnboardingResult = { ok: true } | { ok: false; error: string };

const formSchema = workspaceCreateInputSchema.extend({
  // Coerce the form string into the number the service expects.
  nightlife_cutoff_hour: z.coerce.number().int().min(0).max(12).default(6),
});

/**
 * Server action: create the first workspace for the signed-in user.
 *
 * Called once from the /onboarding form. On success, redirects to
 * /agenda. If the user already has a workspace, short-circuit with
 * redirect (defensive — middleware + page already prevent this path,
 * but a race or a stale submit shouldn't create a second workspace).
 */
export async function createWorkspaceAction(
  formData: FormData,
): Promise<OnboardingResult> {
  const actor = await getCurrentActor();
  if (!actor) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  // If the user already has a workspace, don't create another one.
  const existing = await getCurrentWorkspace();
  if (existing) {
    redirect("/agenda");
  }

  const parsed = formSchema.safeParse({
    name: formData.get("name"),
    service_day_mode: formData.get("service_day_mode") ?? "standard",
    nightlife_cutoff_hour: formData.get("nightlife_cutoff_hour") ?? 6,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first?.message ?? "Please check the form values and try again.",
    };
  }

  try {
    await createWorkspace(parsed.data, actor);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `Could not create workspace: ${message}` };
  }

  // redirect() throws a framework-handled error; no return is reached.
  redirect("/agenda");
}
