import {
  requireWorkspace,
  listInquiriesForCurrentMember,
} from "@/server/services";
import {
  confirmInquiryAction,
  declineInquiryAction,
  archiveInquiryAction,
} from "./actions";

/**
 * /inquiries — owner-facing list of public-share inquiries posted via
 * /share/[token]. Pending sit at top with Confirm/Decline buttons.
 * Confirming creates a placeholder booking on the schedule (status =
 * hold). Below pending are confirmed + declined as a history.
 */
export default async function InquiriesPage() {
  const workspace = await requireWorkspace();
  const all = await listInquiriesForCurrentMember(workspace);

  const pending = all.filter((i) => i.status === "pending");
  const confirmed = all.filter((i) => i.status === "confirmed");
  const declined = all.filter((i) => i.status === "declined");

  return (
    <main className="max-w-screen-md mx-auto p-4 sm:p-8 space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Inquiries</h1>
        <p className="text-xs text-slate-500">
          Posted via your{" "}
          <a
            href="/my-calendar"
            className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
          >
            share link
          </a>
          .
        </p>
      </div>

      {pending.length === 0 && confirmed.length === 0 && declined.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-md p-10 text-center text-sm text-slate-500">
          No inquiries yet. Share your availability link from{" "}
          <a
            href="/my-calendar"
            className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
          >
            My Calendar
          </a>{" "}
          and inquiries will land here.
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <Section
              title={`Pending · ${pending.length}`}
              tone="indigo"
            >
              <ul className="space-y-3">
                {pending.map((i) => (
                  <InquiryCard key={i.id} inquiry={i} state="pending" />
                ))}
              </ul>
            </Section>
          )}

          {confirmed.length > 0 && (
            <Section title={`Confirmed · ${confirmed.length}`} tone="emerald">
              <ul className="space-y-2">
                {confirmed.map((i) => (
                  <InquiryCard key={i.id} inquiry={i} state="confirmed" />
                ))}
              </ul>
            </Section>
          )}

          {declined.length > 0 && (
            <Section title={`Declined · ${declined.length}`} tone="slate">
              <ul className="space-y-2">
                {declined.map((i) => (
                  <InquiryCard key={i.id} inquiry={i} state="declined" />
                ))}
              </ul>
            </Section>
          )}
        </>
      )}
    </main>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "indigo" | "emerald" | "slate";
  children: React.ReactNode;
}) {
  const headingClass =
    tone === "indigo"
      ? "text-indigo-700"
      : tone === "emerald"
      ? "text-emerald-700"
      : "text-slate-600";
  return (
    <section className="space-y-3">
      <h2 className={`text-sm font-semibold uppercase tracking-wider ${headingClass}`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

import type { InquiryRow } from "@/modules/inquiries";

function InquiryCard({
  inquiry,
  state,
}: {
  inquiry: InquiryRow;
  state: "pending" | "confirmed" | "declined";
}) {
  const dateLabel = inquiry.requested_date
    ? new Date(`${inquiry.requested_date}T12:00:00`).toLocaleDateString(
        undefined,
        {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        },
      )
    : "No specific date";

  const ageLabel = formatRelative(new Date(inquiry.created_at));

  return (
    <li
      className={[
        "rounded-lg border bg-white p-4 sm:p-5",
        state === "pending"
          ? "border-indigo-200 shadow-sm"
          : state === "confirmed"
          ? "border-emerald-200 opacity-90"
          : "border-slate-200 opacity-75",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          {inquiry.subject && (
            <p className="text-base font-semibold text-slate-900 leading-tight">
              {inquiry.subject}
            </p>
          )}
          <p className="text-sm text-slate-600 mt-0.5">
            <strong className="text-slate-800">{inquiry.inquirer_name}</strong>{" "}
            <span className="text-slate-500">·</span>{" "}
            <a
              href={`mailto:${inquiry.inquirer_email}`}
              className="text-indigo-600 hover:text-indigo-700"
            >
              {inquiry.inquirer_email}
            </a>
            {inquiry.inquirer_phone && (
              <>
                {" "}
                <span className="text-slate-500">·</span>{" "}
                <a
                  href={`tel:${inquiry.inquirer_phone}`}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  {inquiry.inquirer_phone}
                </a>
              </>
            )}
          </p>
        </div>
        <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
          {ageLabel}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-y-1.5 gap-x-3 text-sm">
        <div className="text-xs uppercase tracking-wider text-slate-500 sm:pt-0.5">
          Date asked
        </div>
        <div className="text-slate-800 tabular-nums">
          {dateLabel}
          {inquiry.requested_time && (
            <span className="text-slate-500"> · {inquiry.requested_time}</span>
          )}
        </div>

        <div className="text-xs uppercase tracking-wider text-slate-500 sm:pt-0.5">
          Message
        </div>
        <div className="text-slate-800 whitespace-pre-wrap break-words">
          {inquiry.message}
        </div>
      </div>

      {state === "pending" && (
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
          <form action={confirmInquiryAction}>
            <input type="hidden" name="id" value={inquiry.id} />
            <button
              type="submit"
              className="btn btn-md btn-primary"
              title="Creates a placeholder booking (status=hold) on your schedule."
            >
              Confirm — add to schedule
            </button>
          </form>
          <form action={declineInquiryAction}>
            <input type="hidden" name="id" value={inquiry.id} />
            <button
              type="submit"
              className="btn btn-md btn-secondary"
            >
              Decline
            </button>
          </form>
          <a
            href={`mailto:${inquiry.inquirer_email}?subject=${encodeURIComponent(
              `Re: ${inquiry.subject ?? "Your AmIFree inquiry"}`,
            )}`}
            className="ml-auto text-xs text-slate-500 hover:text-indigo-700 underline-offset-2 hover:underline"
          >
            Reply by email →
          </a>
        </div>
      )}

      {state === "confirmed" && (
        <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-emerald-700">
            Added to your schedule as a hold. Edit the booking to lock it in.
          </span>
          <a
            href="/agenda"
            className="text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
          >
            Open schedule →
          </a>
        </div>
      )}

      {state === "declined" && (
        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-slate-500">Declined.</span>
          <form action={archiveInquiryAction}>
            <input type="hidden" name="id" value={inquiry.id} />
            <button
              type="submit"
              className="text-xs text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline"
            >
              Archive
            </button>
          </form>
        </div>
      )}
    </li>
  );
}

function formatRelative(d: Date): string {
  const now = Date.now();
  const diffMs = now - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
