import { NextResponse, type NextRequest } from "next/server";
import {
  getStripeClient,
  getWebhookSecret,
} from "@/lib/stripe/client";
import {
  upsertSubscriptionFromStripe,
  markSubscriptionCanceled,
} from "@/server/services";
import type Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 *
 * Receives Stripe webhook events. Signature is verified against the
 * STRIPE_WEBHOOK_SECRET configured in Vercel. Subscription lifecycle
 * events upsert the local subscriptions row so the rest of the app
 * sees the subscription state Stripe has.
 *
 * Stripe retries with exponential backoff if we return non-2xx, so
 * we return 200 even on "expected but ignored" event types.
 */
export const runtime = "nodejs";

// Stripe webhooks need the raw request body to verify the signature.
// Disable Next's built-in body parsing.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "No signature." }, { status: 400 });
  }

  const stripe = getStripeClient();
  const secret = getWebhookSecret();

  // The raw text body is what Stripe signs.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return NextResponse.json(
      { error: "Invalid signature." },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.paused":
      case "customer.subscription.resumed": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscriptionFromStripe(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await markSubscriptionCanceled(sub.id);
        break;
      }
      case "checkout.session.completed": {
        // Checkout finished — the subscription.created event will fire
        // separately and that's where we record the row. Nothing to do
        // here, but keep the case so we don't 404 in logs.
        break;
      }
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        // We don't track invoices today. Logged for now; later we
        // could pop a "card failed, update payment method" banner.
        break;
      }
      default:
        // Unknown event types — log and ack.
        console.log("[stripe-webhook] unhandled event", event.type);
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] handler threw", err);
    // Return 500 so Stripe retries the event.
    return NextResponse.json(
      { error: "Internal handler error." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
