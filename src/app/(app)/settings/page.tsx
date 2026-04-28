import { headers } from "next/headers";
import {
  requireWorkspace,
  getCurrentMember,
  getActiveSubscription,
} from "@/server/services";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { ProfileSection } from "./_components/ProfileSection";
import { PasswordSection } from "./_components/PasswordSection";
import { SubscriptionSection } from "./_components/SubscriptionSection";
import { ServiceDaySection } from "./_components/ServiceDaySection";
import { CalendarPreferencesSection } from "./_components/CalendarPreferencesSection";
import { CalendarSyncSection } from "./_components/CalendarSyncSection";
import { TimezoneSection } from "./_components/TimezoneSection";

export default async function SettingsPage() {
  const workspace = await requireWorkspace();
  const member = await getCurrentMember(workspace);
  const subscription = await getActiveSubscription(workspace);

  // The workspace owner's email lives on auth.users, not always on
  // the workspace_members row — fetch it directly so the profile
  // form always pre-fills accurately.
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const authEmail = user?.email ?? "";

  // Match the price_id against env vars to label the plan as monthly
  // or annual without an extra Stripe API call.
  const priceMonthly = process.env.STRIPE_PRICE_MONTHLY;
  const priceAnnual = process.env.STRIPE_PRICE_ANNUAL;
  const planLabel = subscription
    ? subscription.stripe_price_id === priceAnnual
      ? "Annual"
      : subscription.stripe_price_id === priceMonthly
      ? "Monthly"
      : ""
    : undefined;

  // Build the absolute base URL for the iCal feed link.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "amifreescheduler.com";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const baseUrl = `${proto}://${host}`;

  return (
    <main className="max-w-screen-md mx-auto p-4 sm:p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <SubscriptionSection
        isPro={subscription !== null}
        planLabel={planLabel}
        cancelAtPeriodEnd={subscription?.cancel_at_period_end}
        currentPeriodEnd={subscription?.current_period_end ?? null}
      />

      <ProfileSection
        initialName={member?.name ?? workspace.name ?? ""}
        initialEmail={member?.email ?? authEmail}
        initialPhone={member?.phone ?? ""}
        initialHomeAddress={member?.home_address ?? ""}
        initialHomeCity={member?.home_city ?? ""}
        initialHomeState={member?.home_state ?? ""}
        initialHomeZip={member?.home_zip ?? ""}
      />

      <PasswordSection />

      <ServiceDaySection
        initialMode={workspace.service_day_mode}
        initialCutoffHour={workspace.nightlife_cutoff_hour}
      />

      <CalendarPreferencesSection
        initialView={member?.default_calendar_view ?? 1}
      />

      <TimezoneSection initialTimezone={workspace.timezone} />

      <CalendarSyncSection
        initialToken={workspace.calendar_token}
        baseUrl={baseUrl}
      />
    </main>
  );
}
