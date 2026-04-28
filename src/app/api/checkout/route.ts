import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { getStripeClient, getPrices } from "@/lib/stripe/client";
import { requireWorkspace } from "@/server/services";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/checkout
 *
 * Body: { plan: "monthly" | "annual" }
 *
 * Creates a Stripe Checkout session for the chosen plan and returns
 * the redirect URL. Caller (the /upgrade page) does the redirect on
 * the client side.
 *
 * Workspace_id is recorded in subscription metadata so the webhook
 * handler can map a Stripe subscription back to a workspace row.
 */

export const runtime = "nodejs";

const bodySchema = z.object({
  plan: z.enum(["monthly", "annual"]),
});

export async function POST(req: NextRequest) {
  const workspace = await requireWorkspace();

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json(
      { error: "You must be signed in to upgrade." },
      { status: 401 },
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Pick a plan: monthly or annual." },
      { status: 400 },
    );
  }

  const { monthly, annual } = getPrices();
  const priceId = parsed.data.plan === "annual" ? annual : monthly;

  // Origin URL for success/cancel redirects.
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? "amifreescheduler.com";
  const origin = `${proto}://${host}`;

  // Re-use the existing customer if we have one for this workspace.
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const existingCustomerId =
    (existing as { stripe_customer_id: string } | null)?.stripe_customer_id ??
    undefined;

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: existingCustomerId,
    customer_email: existingCustomerId ? undefined : user.email,
    client_reference_id: workspace.id,
    metadata: { workspace_id: workspace.id, user_id: user.id },
    subscription_data: {
      metadata: { workspace_id: workspace.id, user_id: user.id },
    },
    allow_promotion_codes: true,
    automatic_tax: { enabled: true },
    success_url: `${origin}/settings?upgraded=1`,
    cancel_url: `${origin}/upgrade?canceled=1`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe didn't return a checkout URL." },
      { status: 500 },
    );
  }
  return NextResponse.json({ url: session.url });
}
