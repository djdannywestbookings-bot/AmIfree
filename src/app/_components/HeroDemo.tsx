"use client";

import { useEffect, useState } from "react";

/**
 * HeroDemo — the centerpiece animation on the marketing homepage.
 *
 * Cycles through three real-world client texts (DJ, photographer, MC),
 * showing the paste-to-booking moment in three beats:
 *   1. typing — the messy client text appears character by character
 *   2. parsing — a sweep highlights the message, then the booking card
 *      materializes on the right with staggered field reveals
 *   3. holding — both panels stay still for a beat before the next example
 *
 * Pure React state + CSS transitions. No animation library, no Lottie.
 */

type Example = {
  // Persona label shown in a small pill above the panels.
  persona: string;
  // Raw client text on the left.
  text: string;
  // Parsed booking card on the right.
  booking: {
    title: string;
    venue: string;
    date: string;
    time: string;
    pay: string;
    status: "Booked" | "Hold" | "Inquiry";
  };
};

const EXAMPLES: Example[] = [
  {
    persona: "Wedding DJ",
    text:
      "hey u free sat the 14th 6ish til late at the radisson hotel? cash $1200 for ceremony + reception 🙏",
    booking: {
      title: "Wedding · Ceremony + Reception",
      venue: "Radisson Hotel",
      date: "Sat, Sep 14",
      time: "6:00p – 12:00a",
      pay: "$1,200 · cash",
      status: "Booked",
    },
  },
  {
    persona: "Wedding Photographer",
    text:
      "Looking for a photographer for our 6/22 wedding at the Plaza, 8a-3p — please send rates ASAP",
    booking: {
      title: "Wedding · Photography",
      venue: "The Plaza",
      date: "Sun, Jun 22",
      time: "8:00a – 3:00p",
      pay: "Quote pending",
      status: "Inquiry",
    },
  },
  {
    persona: "Corporate MC",
    text:
      "MC needed Sat night for 200 ppl corporate event at Marriott downtown, 7-11p, $1500 paid in full",
    booking: {
      title: "Corporate · MC",
      venue: "Marriott Downtown",
      date: "Sat, Nov 23",
      time: "7:00p – 11:00p",
      pay: "$1,500 · paid",
      status: "Booked",
    },
  },
];

// Beat timing (ms). Sum of phases = full loop per example.
const TYPE_PER_CHAR = 22;
const TYPE_DONE_HOLD = 600;     // pause after typing completes
const PARSE_DURATION = 900;     // sweep highlight pass
const CARD_REVEAL = 800;        // staggered field fade-in
const FINAL_HOLD = 2400;        // hold the parsed card on screen
const FADE_OUT = 350;

type Phase = "typing" | "parsing" | "card" | "fading";

export function HeroDemo() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState("");

  const example = EXAMPLES[exampleIndex];

  // Drive the animation phases for a single example.
  useEffect(() => {
    setPhase("typing");
    setTyped("");

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Typing
    let i = 0;
    const typeInterval = setInterval(() => {
      if (cancelled) return;
      i += 1;
      setTyped(example.text.slice(0, i));
      if (i >= example.text.length) {
        clearInterval(typeInterval);
        timeouts.push(
          setTimeout(() => {
            if (!cancelled) setPhase("parsing");
          }, TYPE_DONE_HOLD),
        );
      }
    }, TYPE_PER_CHAR);

    return () => {
      cancelled = true;
      clearInterval(typeInterval);
      timeouts.forEach(clearTimeout);
    };
  }, [exampleIndex, example.text]);

  // Drive the phase transitions after typing.
  useEffect(() => {
    if (phase === "parsing") {
      const t = setTimeout(() => setPhase("card"), PARSE_DURATION);
      return () => clearTimeout(t);
    }
    if (phase === "card") {
      const t = setTimeout(
        () => setPhase("fading"),
        CARD_REVEAL + FINAL_HOLD,
      );
      return () => clearTimeout(t);
    }
    if (phase === "fading") {
      const t = setTimeout(() => {
        setExampleIndex((i) => (i + 1) % EXAMPLES.length);
      }, FADE_OUT);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const cardVisible = phase === "card" || phase === "fading";
  const fading = phase === "fading";

  const statusClass =
    example.booking.status === "Booked"
      ? "bg-teal-400/15 text-teal-300 border-teal-400/30"
      : example.booking.status === "Hold"
      ? "bg-amber-400/15 text-amber-300 border-amber-400/30"
      : "bg-slate-400/15 text-slate-300 border-slate-400/30";

  return (
    <div
      className={`relative transition-opacity duration-300 ${fading ? "opacity-40" : "opacity-100"}`}
    >
      {/* Persona chip */}
      <div className="absolute -top-3 left-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900 border border-slate-700 text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          {example.persona}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* LEFT — incoming message */}
        <div className="relative rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-800 bg-slate-900/80">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500/70" />
            <span className="ml-2 text-[11px] text-slate-500 font-mono">
              from: client
            </span>
          </div>
          <div className="p-5 min-h-[180px]">
            <div className="rounded-2xl rounded-tl-sm bg-slate-800/80 px-4 py-3 max-w-[95%] text-[15px] leading-relaxed text-slate-200">
              <span className="whitespace-pre-wrap">{typed}</span>
              {phase === "typing" && (
                <span className="inline-block w-[2px] h-[1.1em] bg-teal-400 align-middle ml-0.5 animate-pulse" />
              )}
            </div>

            {/* Parse sweep — only during 'parsing' phase. The `sweep`
             *  keyframe is defined in tailwind.config.ts so this works
             *  with Tailwind's animate-* utility. */}
            {phase === "parsing" && (
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                aria-hidden
              >
                <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent animate-sweep" />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — parsed booking card */}
        <div
          className={`relative rounded-xl border bg-slate-900/60 backdrop-blur-sm transition-all duration-500 ${
            cardVisible
              ? "border-indigo-500/40 opacity-100 translate-y-0 shadow-[0_0_60px_-15px_rgba(99,102,241,0.4)]"
              : "border-slate-800 opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
              Booking detected
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusClass}`}
            >
              {example.booking.status}
            </span>
          </div>
          <div className="p-5 space-y-3.5">
            <Field
              label="Event"
              value={example.booking.title}
              shown={cardVisible}
              delay={120}
            />
            <Field
              label="Venue"
              value={example.booking.venue}
              shown={cardVisible}
              delay={220}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Date"
                value={example.booking.date}
                shown={cardVisible}
                delay={320}
              />
              <Field
                label="Time"
                value={example.booking.time}
                shown={cardVisible}
                delay={400}
              />
            </div>
            <Field
              label="Pay"
              value={example.booking.pay}
              shown={cardVisible}
              delay={500}
            />
            <div
              className={`pt-3 border-t border-slate-800 flex items-center justify-between transition-opacity duration-300 ${
                cardVisible ? "opacity-100 delay-[700ms]" : "opacity-0"
              }`}
            >
              <span className="text-[11px] text-slate-500">
                Synced to your calendar
              </span>
              <CheckIcon />
            </div>
          </div>
        </div>
      </div>

      {/* progress dots */}
      <div className="flex items-center justify-center gap-1.5 mt-6">
        {EXAMPLES.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === exampleIndex ? "w-8 bg-indigo-400" : "w-1.5 bg-slate-700"
            }`}
          />
        ))}
      </div>

    </div>
  );
}

function Field({
  label,
  value,
  shown,
  delay,
}: {
  label: string;
  value: string;
  shown: boolean;
  delay: number;
}) {
  return (
    <div
      className={`transition-all duration-300 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
    >
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mb-0.5">
        {label}
      </div>
      <div className="text-[15px] text-slate-100 font-medium tabular-nums">
        {value}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-teal-400"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
