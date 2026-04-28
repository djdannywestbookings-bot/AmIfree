"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * SubscriptionSection — billing card on /settings.
 *
 * Two states:
 *   - Pro: shows current plan + Manage subscription button (opens
 *     Stripe Customer Portal for self-serve cancel / swap / update
 *     payment method)
 *   - Free: shows Upgrade CTA pointing at /upgrade
 */
export function SubscriptionSection({
  isPro,
  planLabel,
  cancelAtPeriodEnd,
  currentPeriodEnd,
}: {
  isPro: boolean;
  planLabel?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Couldn't open portal.");
      window.location.href = data.url;
    } catch (err) {
      setPending(false);
      setError(err instanceof Error ? err.message : "Couldn't open portal.");
    }
  }

  if (!isPro) {
    return (
      <section className="border border-indigo-200 rounded-lg p-5 bg-gradient-to-br from-indigo-50 via-white to-teal-50 space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-indigo-700">Subscription</h2>
          <p className="text-sm text-slate-700 mt-1">
            You&rsquo;re on the free plan. Upgrade to AmIFree Pro for
            multi-calendar sync, unlimited AI extraction, inquiry capture,
            history search, and priority support.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/upgrade" className="btn btn-md btn-primary">
            Upgrade to Pro
          </Link>
          <span className="text-xs text-slate-500">From $9/mo or $79/yr.</span>
        </div>
      </section>
    );
  }

  // Pro state
  const periodEndLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <section className="border border-slate-200 rounded-lg p-5 bg-white space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-indigo-700">Subscription</h2>
        <p className="text-sm text-slate-700 mt-1">
          You&rsquo;re on{" "}
          <strong className="text-slate-900">
            AmIFree Pro {planLabel ? `· ${planLabel}` : ""}
          </strong>
          .
          {periodEndLabel && (
            <>
              {" "}
              {cancelAtPeriodEnd ? (
                <span className="text-amber-700">
                  Ends {periodEndLabel} — no further charges.
                </span>
              ) : (
                <span className="text-slate-500">
                  Renews {periodEndLabel}.
                </span>
              )}
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={openPortal}
          disabled={pending}
          className="btn btn-md btn-secondary"
        >
          {pending ? "Opening…" : "Manage subscription"}
        </button>
        <span className="text-xs text-slate-500">
          Update payment method, change plan, or cancel — handled by Stripe.
        </span>
      </div>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
