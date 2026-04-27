import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeroDemo } from "./_components/HeroDemo";

/**
 * Marketing homepage at `/` — front door for amifreescheduler.com.
 *
 * Authenticated users skip the marketing site entirely and land on
 * /calendar (the canonical authed surface). Everyone else sees the
 * dark-themed marketing page with the cycling paste-and-parse demo
 * as the centerpiece.
 *
 * The page is self-contained dark — it does NOT toggle the global
 * theme. The bg-slate-950 wrapper hard-overrides the body's slate-50.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/calendar");

  return (
    <div className="bg-slate-950 text-slate-100 -mx-0 min-h-dvh">
      {/* Top nav --------------------------------------------------- */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-950/70 border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold tracking-tight text-base">
            <span className="text-indigo-400">AmI</span>
            <span className="text-teal-400">Free</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <a
              href="#pricing"
              className="hidden sm:inline text-slate-400 hover:text-slate-200 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="hidden sm:inline text-slate-400 hover:text-slate-200 transition-colors"
            >
              FAQ
            </a>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-md bg-white text-slate-900 text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO ---------------------------------------------------- */}
        <section className="relative overflow-hidden">
          {/* subtle gradient + grid backdrop */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-10%,rgba(79,70,229,0.18),transparent_50%),radial-gradient(circle_at_80%_10%,rgba(20,184,166,0.10),transparent_55%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
          />

          <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20">
            <div className="max-w-3xl">
              {/* Tag — names the audience explicitly */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/60 text-[11px] font-medium text-slate-400 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                For DJs, photographers, MCs &amp; the rest of us booking by text
              </div>

              <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
                Never lose a Saturday
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-teal-300 bg-clip-text text-transparent">
                  to a forgotten text.
                </span>
              </h1>

              <p className="mt-5 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl">
                Paste any client text. AmIFree pulls out the gig and warns
                you before you double-book the date.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-11 px-5 rounded-md bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-sm shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] transition-colors"
                >
                  Get started — it&rsquo;s free
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center gap-1.5 h-11 px-4 rounded-md border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                >
                  See how it works
                  <span aria-hidden>↓</span>
                </a>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                No credit card. No password. Sign in with Apple or Google.
              </p>
            </div>

            {/* Hero demo */}
            <div className="mt-12 sm:mt-16">
              <HeroDemo />
            </div>
          </div>
        </section>

        {/* THREE PILLARS ------------------------------------------- */}
        <section className="relative border-t border-slate-900">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-12">
              Three things AmIFree does well.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Pillar
                icon={<MessageIcon />}
                accent="indigo"
                title="Paste a text. Get a booking."
                body="Every client books differently — some send paragraphs, some send 'sat 6p $800 cash.' AmIFree reads either, pulls out the date, time, venue, and pay, and shows you a clean booking to confirm."
              />
              <Pillar
                icon={<AlertIcon />}
                accent="amber"
                title="Never double-book."
                body="The moment you save a new gig, AmIFree checks it against everything else on your calendar. If you're already booked that night, you see it before you reply &lsquo;yes.&rsquo;"
              />
              <Pillar
                icon={<CalendarIcon />}
                accent="teal"
                title="Works with your calendar."
                body="One-way iCal feed pushes every confirmed booking to Google, Apple, or Outlook in under a minute. You don't switch apps — your calendar just stays current."
              />
            </div>
          </div>
        </section>

        {/* PERSONA SECTION ----------------------------------------- */}
        <section className="relative border-t border-slate-900 bg-slate-950">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 sm:gap-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  This is for you if you book gigs by text.
                </h2>
                <p className="mt-4 text-slate-400 leading-relaxed">
                  AmIFree was built for the people whose calendar lives in
                  their phone&apos;s message thread. Not project managers.
                  Not agencies. The people taking the gig themselves.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  "Wedding DJs",
                  "Photographers",
                  "MCs & emcees",
                  "Sound techs",
                  "Live musicians",
                  "Bartenders",
                  "Officiants",
                  "Videographers",
                  "Mobile DJs",
                ].map((p) => (
                  <div
                    key={p}
                    className="px-4 py-3 rounded-lg border border-slate-800 bg-slate-900/40 text-sm text-slate-200"
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS -------------------------------------------- */}
        <section id="how" className="relative border-t border-slate-900">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
              From text to booked, in three steps.
            </h2>
            <p className="text-slate-400 mb-12 max-w-2xl">
              No setup, no template, no field-by-field data entry. Open
              AmIFree, paste, confirm.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Step
                num="01"
                title="Paste any client text or email."
                body="Drop the message into Intake. Texts, DMs, emails, even a screenshot — AmIFree reads it."
              />
              <Step
                num="02"
                title="Review the booking AmIFree extracted."
                body="You see the parsed booking before anything saves. Edit the fields the AI got close-but-not-right; ignore it if it nailed it."
              />
              <Step
                num="03"
                title="Confirm. It's on your calendar."
                body="One click. AmIFree pushes the booking to your real calendar and warns you if it collides with something already there."
              />
            </div>
          </div>
        </section>

        {/* PRICING ------------------------------------------------- */}
        <section
          id="pricing"
          className="relative border-t border-slate-900 bg-slate-950"
        >
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
              Pricing.
            </h2>
            <p className="text-slate-400 mb-12">
              Free works for solo bookers. Pro is for the weeks you actually
              need it to remember everything.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PricingCard
                tier="Free"
                price="$0"
                cadence="forever"
                cta="Get started"
                ctaHref="/login"
                features={[
                  "Unlimited bookings",
                  "Paste-to-booking AI extraction",
                  "Single calendar sync (Google, Apple, or Outlook)",
                  "Basic conflict detection",
                  "PWA — install on your phone",
                ]}
              />
              <PricingCard
                tier="Pro"
                price="$5"
                cadence="per month"
                featured
                cta="Try Pro"
                ctaHref="/login"
                features={[
                  "Everything in Free",
                  "Multi-calendar sync (push to all three at once)",
                  "Buffer time on conflict detection",
                  "Unlimited screenshot intake",
                  "Booking history search",
                  "Priority support",
                ]}
              />
            </div>

            <p className="mt-8 text-xs text-slate-500 text-center">
              Pricing under review during launch — early users get Pro at
              the rate they sign up at, for life.
            </p>
          </div>
        </section>

        {/* FAQ ----------------------------------------------------- */}
        <section id="faq" className="relative border-t border-slate-900">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-12">
              Questions.
            </h2>
            <div className="divide-y divide-slate-900">
              <Faq
                q="Is this another HoneyBook?"
                a="No. AmIFree is the booking-capture layer — the moment between &lsquo;hey are you free?&rsquo; and the booking landing on your calendar. If you use HoneyBook for invoicing and contracts, AmIFree pairs with it. Most of our users don't use HoneyBook because it's overkill for solo work."
              />
              <Faq
                q="Does it work with my calendar?"
                a="Yes — Google Calendar, Apple Calendar, and Outlook. AmIFree publishes a private iCal feed that any calendar app can subscribe to. One link, set once."
              />
              <Faq
                q="Will it work on my phone?"
                a="Mobile-first. AmIFree installs as a PWA — open in Safari or Chrome, add to home screen, it behaves like a native app. No App Store wait."
              />
              <Faq
                q="What if the AI gets a booking wrong?"
                a="You review every booking before it saves. The AI shows you what it parsed, you edit anything that's off, then confirm. Nothing lands on your calendar without your sign-off."
              />
              <Faq
                q="Will you train AI on my client data?"
                a="No. Your bookings are yours. AmIFree calls OpenAI's API to do the extraction; nothing is stored or used for model training. Your message threads stay in your phone — only the parsed booking lives in AmIFree."
              />
              <Faq
                q="How does pricing work?"
                a={
                  <>
                    Free covers most solo work. Pro adds multi-calendar
                    sync and unlimited screenshot intake. See{" "}
                    <a
                      href="#pricing"
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      pricing
                    </a>
                    .
                  </>
                }
              />
            </div>
          </div>
        </section>

        {/* CTA STRIP ----------------------------------------------- */}
        <section className="relative border-t border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight">
              Stop scrolling for the date.
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Paste the next client text into AmIFree and see what shows
              up. If it doesn&rsquo;t save you ten minutes this week, close
              the tab.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-sm shadow-[0_0_40px_-5px_rgba(99,102,241,0.6)] transition-colors"
              >
                Try AmIFree — free
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER -------------------------------------------------- */}
      <footer className="border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-sm">
          <div>
            <Link href="/" className="font-bold tracking-tight text-base">
              <span className="text-indigo-400">AmI</span>
              <span className="text-teal-400">Free</span>
            </Link>
            <p className="text-slate-500 mt-2 text-xs max-w-xs">
              Booking capture for service providers who book by text.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-slate-400">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign in
            </Link>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <a
              href="mailto:support@amifreescheduler.com"
              className="hover:text-white transition-colors"
            >
              Support
            </a>
          </div>
          <p className="text-xs text-slate-600 sm:text-right">
            © {new Date().getFullYear()} AmIFree
          </p>
        </div>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- *
 * Section helpers
 * -------------------------------------------------------------------------- */

function Pillar({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: "indigo" | "amber" | "teal";
}) {
  const accentClass =
    accent === "indigo"
      ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
      : accent === "amber"
      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
      : "bg-teal-500/10 text-teal-300 border-teal-500/30";
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 hover:border-slate-700 transition-colors">
      <div
        className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border ${accentClass} mb-5`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-slate-400 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function Step({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="text-xs font-mono text-indigo-400 mb-3">{num}</div>
      <h3 className="text-base font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function PricingCard({
  tier,
  price,
  cadence,
  features,
  cta,
  ctaHref,
  featured,
}: {
  tier: string;
  price: string;
  cadence: string;
  features: string[];
  cta: string;
  ctaHref: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`relative rounded-xl p-7 ${
        featured
          ? "border-2 border-indigo-500/50 bg-gradient-to-b from-indigo-500/[0.07] to-transparent shadow-[0_0_50px_-15px_rgba(99,102,241,0.4)]"
          : "border border-slate-800 bg-slate-900/40"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-7 px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-semibold uppercase tracking-wider">
          Recommended
        </span>
      )}
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        {tier}
      </h3>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">
          {price}
        </span>
        <span className="text-slate-500 text-sm">{cadence}</span>
      </div>
      <ul className="mt-6 space-y-2.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-slate-300">
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`mt-7 inline-flex items-center justify-center w-full h-11 rounded-md text-sm font-medium transition-colors ${
          featured
            ? "bg-indigo-500 hover:bg-indigo-400 text-white"
            : "bg-white text-slate-900 hover:bg-slate-100"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: React.ReactNode }) {
  return (
    <details className="group py-5">
      <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
        <span className="text-base font-medium text-slate-100">{q}</span>
        <span
          aria-hidden
          className="shrink-0 w-6 h-6 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 group-open:rotate-45 transition-transform"
        >
          +
        </span>
      </summary>
      <div className="mt-3 text-slate-400 text-sm leading-relaxed">{a}</div>
    </details>
  );
}

/* -------------------------------------------------------------------------- *
 * Inline SVG icons — small enough to inline, avoid the Lucide dep.
 * -------------------------------------------------------------------------- */

function MessageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400 mt-0.5 shrink-0" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
