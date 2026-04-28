"use client";

import { useState } from "react";

/**
 * UpgradeForm — two pricing cards, monthly vs annual.
 *
 * Posts to /api/checkout, gets back a Stripe Checkout URL, redirects
 * the browser there. Stripe Checkout handles card collection, tax
 * calculation, success/cancel routing.
 */

const CHECK = "✓";

const FEATURES = [
  "Unlimited bookings",
  "Unlimited AI text extraction",
  "Unlimited screenshot intake",
  "Multi-calendar sync (Google + Apple + Outlook)",
  "Public availability share link",
  "Unlimited inquiry capture",
  "Booking history search",
  "Buffer time on conflict detection",
  "Priority support",
];

export function UpgradeForm() {
  const [pending, setPending] = useState<"monthly" | "annual" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(plan: "monthly" | "annual") {
    setPending(plan);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Couldn't start checkout.");
      }
      window.location.href = data.url;
    } catch (err) {
      setPending(null);
      setError(err instanceof Error ? err.message : "Couldn't start checkout.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7 flex flex-col">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Monthly
          </h3>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight tabular-nums text-slate-900">
              $9
            </span>
            <span className="text-slate-500 text-sm">/ month</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cancel any time. No setup fee.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700 flex-1">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">{CHECK}</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => go("monthly")}
            disabled={pending !== null}
            className="mt-6 inline-flex items-center justify-center w-full h-11 rounded-md bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {pending === "monthly" ? "Redirecting…" : "Choose monthly"}
          </button>
        </div>

        {/* Annual — featured */}
        <div className="relative rounded-xl border-2 border-indigo-500/60 bg-gradient-to-b from-indigo-500/[0.06] to-transparent p-6 sm:p-7 shadow-[0_0_60px_-15px_rgba(99,102,241,0.4)] flex flex-col">
          <span className="absolute -top-3 left-7 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-semibold uppercase tracking-wider shadow-[0_0_20px_-2px_rgba(99,102,241,0.6)]">
            Save 27%
          </span>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-700">
            Annual
          </h3>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight tabular-nums text-slate-900">
              $79
            </span>
            <span className="text-slate-500 text-sm">/ year</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            That&rsquo;s $6.58/mo — two months free.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700 flex-1">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">{CHECK}</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => go("annual")}
            disabled={pending !== null}
            className="mt-6 inline-flex items-center justify-center w-full h-11 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50 transition-colors shadow-sm"
          >
            {pending === "annual" ? "Redirecting…" : "Choose annual"}
          </button>
        </div>
      </div>

      {error && (
        <p
          className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-center"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
