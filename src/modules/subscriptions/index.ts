import { z } from "zod";

/**
 * Subscription types — local mirror of Stripe subscription state.
 * The /api/webhooks/stripe handler keeps these rows in sync on every
 * customer.subscription.* event from Stripe.
 */

// Stripe's subscription.status enum, lifted verbatim.
export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

/** Statuses that grant Pro access. */
export const ACTIVE_SUBSCRIPTION_STATUSES: ReadonlySet<SubscriptionStatus> =
  new Set(["trialing", "active"]);

export const subscriptionRowSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  stripe_customer_id: z.string(),
  stripe_subscription_id: z.string(),
  stripe_price_id: z.string(),
  status: z.enum(SUBSCRIPTION_STATUSES),
  current_period_end: z.string().datetime({ offset: true }).nullable(),
  cancel_at_period_end: z.boolean(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export type SubscriptionRow = z.infer<typeof subscriptionRowSchema>;
