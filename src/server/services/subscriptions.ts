import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  subscriptionRowSchema,
  ACTIVE_SUBSCRIPTION_STATUSES,
  type SubscriptionRow,
  type SubscriptionStatus,
} from "@/modules/subscriptions";
import type { WorkspaceRow } from "@/modules/auth";
import type Stripe from "stripe";

/**
 * Subscriptions service.
 *
 * Read path: getActiveSubscription / isPro for paywall checks.
 * Write path: upsertSubscriptionFromStripe — called from the webhook
 * handler whenever Stripe sends customer.subscription.* events.
 */

export async function getActiveSubscription(
  workspace: Pick<WorkspaceRow, "id">,
): Promise<SubscriptionRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("*")
    .eq("workspace_id", workspace.id)
    .in("status", Array.from(ACTIVE_SUBSCRIPTION_STATUSES))
    .order("current_period_end", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return subscriptionRowSchema.parse(data);
}

/** Tight boolean wrapper for paywall gates. */
export async function isPro(
  workspace: Pick<WorkspaceRow, "id">,
): Promise<boolean> {
  const sub = await getActiveSubscription(workspace);
  return sub !== null;
}

/**
 * Upsert from a Stripe.Subscription object. Called by the webhook
 * handler. Writes through the admin client (bypasses RLS) since the
 * webhook is authenticated by Stripe signature, not by user session.
 */
export async function upsertSubscriptionFromStripe(
  sub: Stripe.Subscription,
): Promise<void> {
  // workspace_id is stored in subscription metadata at checkout time
  // (see /api/checkout). Falls back to customer metadata for safety.
  const customerMeta =
    typeof sub.customer === "object" && sub.customer !== null && !sub.customer.deleted
      ? sub.customer.metadata
      : undefined;
  const workspaceId =
    (sub.metadata?.workspace_id as string | undefined) ??
    (customerMeta?.workspace_id as string | undefined);

  if (!workspaceId) {
    console.error(
      "[stripe-webhook] subscription has no workspace_id in metadata",
      { subscription: sub.id },
    );
    return;
  }

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  // First item's price is the plan's price (we only sell single-line
  // subscriptions). If Stripe's shape ever changes to support multiple
  // items per subscription on AmIFree, revisit.
  const priceId = sub.items.data[0]?.price.id ?? "";

  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;

  const admin = createAdminClient();
  const { error } = await admin
    .from("subscriptions")
    .upsert(
      {
        workspace_id: workspaceId,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        stripe_price_id: priceId,
        status: sub.status as SubscriptionStatus,
        current_period_end: periodEnd,
        cancel_at_period_end: sub.cancel_at_period_end,
      },
      { onConflict: "stripe_subscription_id" },
    );

  if (error) {
    console.error("[stripe-webhook] upsert failed", error);
    throw new Error(error.message);
  }
}

/**
 * Mark a subscription as canceled in our mirror. Called when Stripe
 * sends customer.subscription.deleted (subscription has fully ended,
 * not just scheduled for cancellation at period end).
 */
export async function markSubscriptionCanceled(
  stripeSubscriptionId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", stripeSubscriptionId);
  if (error) throw new Error(error.message);
}
