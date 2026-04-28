import { redirect } from "next/navigation";
import {
  requireWorkspace,
  getActiveSubscription,
} from "@/server/services";
import { UpgradeForm } from "./_components/UpgradeForm";

/**
 * /upgrade — Pro plan pricing page.
 *
 * If the workspace already has an active subscription, redirect to
 * /settings (where Manage Subscription lives) since there's nothing
 * to upgrade to.
 */
export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const workspace = await requireWorkspace();
  const sub = await getActiveSubscription(workspace);
  if (sub) {
    redirect("/settings?already_pro=1");
  }

  const params = await searchParams;
  const canceled = params.canceled === "1";

  return (
    <main className="max-w-screen-md mx-auto p-4 sm:p-8 space-y-8">
      <header className="text-center space-y-2">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          Upgrade
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          AmIFree Pro
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Multi-calendar sync, unlimited AI extraction, inquiry capture,
          history search, and priority support — for working gig pros
          who book for a living.
        </p>
      </header>

      {canceled && (
        <div
          className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-4 py-3 max-w-md mx-auto"
          role="status"
        >
          Checkout canceled. Your account is unchanged.
        </div>
      )}

      <UpgradeForm />

      <div className="text-center space-y-1 text-xs text-slate-500">
        <p>Cancel any time. No questions, no exit interview.</p>
        <p>
          Already paid?{" "}
          <a
            href="/settings"
            className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
          >
            Manage your subscription
          </a>
          .
        </p>
      </div>
    </main>
  );
}
