import { headers } from "next/headers";
import {
  requireWorkspace,
  getCurrentMember,
} from "@/server/services";
import { ProfileSection } from "./_components/ProfileSection";
import { PasswordSection } from "./_components/PasswordSection";
import { ServiceDaySection } from "./_components/ServiceDaySection";
import { CalendarPreferencesSection } from "./_components/CalendarPreferencesSection";
import { CalendarSyncSection } from "./_components/CalendarSyncSection";
import { TimezoneSection } from "./_components/TimezoneSection";

export default async function SettingsPage() {
  const workspace = await requireWorkspace();
  const member = await getCurrentMember(workspace);

  // Build the absolute base URL for the iCal feed link.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "amifreescheduler.com";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const baseUrl = `${proto}://${host}`;

  return (
    <main className="max-w-screen-md mx-auto p-4 sm:p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <ProfileSection
        initialName={member?.name ?? workspace.name ?? ""}
        initialEmail={member?.email ?? ""}
        initialPhone={member?.phone ?? ""}
        initialHomeAddress={member?.home_address ?? ""}
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
