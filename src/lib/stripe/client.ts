import "server-only";

import Stripe from "stripe";

/**
 * Lazily-instantiated Stripe SDK client.
 *
 * Reads STRIPE_SECRET_KEY from env. The wrapper is `() => Stripe`
 * (not a top-level `new Stripe(...)`) so importing this module at
 * build time doesn't crash when the env var is missing — useful for
 * preview deploys where Stripe isn't configured yet.
 */
let _stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Add it to Vercel env vars.",
    );
  }
  _stripe = new Stripe(key, {
    // Pin the API version so Stripe rolling forward doesn't silently
    // change response shapes under us. Bump deliberately when the SDK
    // version pinned in package.json moves.
    apiVersion: "2025-02-24.acacia",
    appInfo: {
      name: "AmIFree",
      url: "https://amifreescheduler.com",
    },
  });
  return _stripe;
}

/** Webhook signing secret used by /api/webhooks/stripe. */
export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not configured. Add it to Vercel env vars.",
    );
  }
  return secret;
}

/** Configured price IDs for the AmIFree Pro plan. */
export function getPrices(): { monthly: string; annual: string } {
  const monthly = process.env.STRIPE_PRICE_MONTHLY;
  const annual = process.env.STRIPE_PRICE_ANNUAL;
  if (!monthly || !annual) {
    throw new Error(
      "STRIPE_PRICE_MONTHLY / STRIPE_PRICE_ANNUAL are not configured.",
    );
  }
  return { monthly, annual };
}
