import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripeClient } from "@/lib/stripe/client";
import { requireWorkspace } from "@/server/services";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/portal
 *
 * Returns a Stripe Customer Portal URL for the workspace's existing
 * customer so the user can update payment method, switch plans, view
 * invoices, or cancel — all self-serve.
 */
export const runtime = "nodejs";

export async function POST() {
  const workspace = await requireWorkspace();

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const customerId = (existing as { stripe_customer_id: string } | null)
    ?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json(
      { error: "No active subscription found." },
      { status: 404 },
    );
  }

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? "amifreescheduler.com";
  const returnUrl = `${proto}://${host}/settings`;

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return NextResponse.json({ url: session.url });
}
