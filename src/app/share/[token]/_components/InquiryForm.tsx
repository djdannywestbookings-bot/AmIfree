"use client";

import { useState, type FormEvent } from "react";
import { submitInquiryAction } from "../inquiry-actions";

/**
 * InquiryForm — public form on /share/[token].
 *
 * Open-by-default for visibility (no extra click to expand). Inquirer
 * fills name, email, optional phone, an optional requested date +
 * time, a subject line, and a message. Submit posts the inquiry to
 * the owner's pending list.
 */
export function InquiryForm({
  token,
  recipientName,
}: {
  token: string;
  recipientName: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData();
    form.set("token", token);
    form.set("inquirer_name", name);
    form.set("inquirer_email", email);
    if (phone) form.set("inquirer_phone", phone);
    if (requestedDate) form.set("requested_date", requestedDate);
    if (requestedTime) form.set("requested_time", requestedTime);
    if (subject) form.set("subject", subject);
    form.set("message", message);

    const result = await submitInquiryAction(form);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
    setName("");
    setEmail("");
    setPhone("");
    setRequestedDate("");
    setRequestedTime("");
    setSubject("");
    setMessage("");
  }

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <h3 className="text-base font-semibold text-emerald-900">
          Inquiry sent.
        </h3>
        <p className="mt-2 text-sm text-emerald-800">
          {recipientName.split(" ")[0] || recipientName} will see your
          message and reply directly to{" "}
          <strong>{email || "your email"}</strong>. No account needed on
          your end.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-4 text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-4"
    >
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Inquire about a date
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Quick note → {recipientName} sees it the moment they open
          AmIFree. No account required to send.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">
            Your name <span className="text-red-600">*</span>
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">
            Your email <span className="text-red-600">*</span>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">
            Phone (optional)
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={40}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">
            Date you&rsquo;re asking about
          </span>
          <input
            type="date"
            value={requestedDate}
            onChange={(e) => setRequestedDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="block text-xs font-medium text-slate-700 mb-1">
            Time / window (optional)
          </span>
          <input
            type="text"
            value={requestedTime}
            onChange={(e) => setRequestedTime(e.target.value)}
            maxLength={60}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
          />
          <span className="block text-[11px] text-slate-500 mt-1">
            e.g. &ldquo;evening&rdquo;, &ldquo;8pm – midnight&rdquo;,
            &ldquo;all day&rdquo;.
          </span>
        </label>
      </div>

      <label className="block">
        <span className="block text-xs font-medium text-slate-700 mb-1">
          Subject
        </span>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
        />
        <span className="block text-[11px] text-slate-500 mt-1">
          e.g. &ldquo;Looking to book you Sat May 4&rdquo;,
          &ldquo;Quick call to chat about a wedding&rdquo;.
        </span>
      </label>

      <label className="block">
        <span className="block text-xs font-medium text-slate-700 mb-1">
          Message <span className="text-red-600">*</span>
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          maxLength={4000}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 leading-relaxed"
        />
      </label>

      {error && (
        <p
          className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center h-11 px-5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm disabled:opacity-50 transition-colors shadow-sm"
      >
        {pending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
