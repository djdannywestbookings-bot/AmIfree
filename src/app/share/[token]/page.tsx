import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getShareTargetByToken,
  listBusyBlocksForMember,
} from "@/server/services";
import { AvailabilityView } from "./_components/AvailabilityView";
import { InquiryForm } from "./_components/InquiryForm";

/**
 * /share/[token] — public availability page.
 *
 * Anyone with the URL sees an anonymized calendar of the linked
 * member's busy/free blocks. No titles, venues, pay, or notes
 * leak through this surface — `listBusyBlocksForMember` returns
 * only the time fields needed to render busy slots.
 *
 * No auth required. Token IS the access control. Rotate from
 * /my-calendar to invalidate.
 */
export const dynamic = "force-dynamic";

export default async function PublicAvailabilityPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const target = await getShareTargetByToken(token);
  if (!target) notFound();

  const { member, workspace } = target;
  const blocks = await listBusyBlocksForMember(workspace, member);

  // Member-facing display name. Falls back to the workspace name (which
  // is mirrored from the user's profile name in /settings) if the
  // member row hasn't set one.
  const displayName =
    member.name?.trim() ||
    workspace.name?.trim() ||
    "AmIFree user";

  return (
    <main className="min-h-dvh bg-slate-50">
      {/* Public top bar — minimal, brand wordmark + sign-up CTA */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-screen-md mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold tracking-tight text-base">
            <span className="text-indigo-700">AmI</span>
            <span className="text-teal-500">Free</span>
          </Link>
          <Link
            href="/login"
            className="text-xs px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Get your own
          </Link>
        </div>
      </header>

      <section className="max-w-screen-md mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          {displayName}&rsquo;s availability
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-xl">
          Here&rsquo;s when {displayName.split(" ")[0] || displayName} is free.
          Booked time is shown as <strong className="text-slate-900">Busy</strong>{" "}
          — no other details. Reach out directly to inquire about a date.
        </p>

        <div className="mt-8">
          <AvailabilityView
            blocks={blocks.map((b) => ({
              id: b.id,
              start_at: b.start_at,
              end_at: b.end_at,
              all_day: b.all_day,
              service_day: b.service_day,
            }))}
            timezone={workspace.timezone}
          />
        </div>

        <div className="mt-10">
          <InquiryForm token={token} recipientName={displayName} />
        </div>

        <p className="mt-10 text-xs text-slate-500 text-center">
          Powered by{" "}
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
          >
            AmIFree
          </Link>{" "}
          — booking capture for service providers.
        </p>
      </section>
    </main>
  );
}
