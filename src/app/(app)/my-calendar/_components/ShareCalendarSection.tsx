"use client";

import { useState } from "react";
import { rotateShareTokenAction } from "../share-actions";

/**
 * ShareCalendarSection — controls for the per-user public availability
 * link. Lives at the top of /my-calendar.
 *
 * If the user has no token yet, shows a "Create share link" button.
 * Once generated, shows the full URL with copy + rotate buttons and
 * a short note about what recipients can (and can't) see.
 *
 * The actual public page lives at /share/[token].
 */
export function ShareCalendarSection({
  initialToken,
  baseUrl,
}: {
  initialToken: string | null;
  baseUrl: string;
}) {
  const [token, setToken] = useState<string | null>(initialToken);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const url = token ? `${baseUrl}/share/${token}` : null;

  async function generate() {
    setPending(true);
    setError(null);
    const result = await rotateShareTokenAction();
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setToken(result.token);
  }

  async function copyUrl() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy. Select the URL manually instead.");
    }
  }

  async function rotate() {
    if (
      !window.confirm(
        "Generate a new share link? The old link will stop working immediately.",
      )
    ) {
      return;
    }
    await generate();
  }

  return (
    <section className="border border-slate-200 rounded-lg p-5 bg-white space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-indigo-700">
          Share my availability
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          A public link anyone can open to see when you&rsquo;re free —
          shown as <strong>busy</strong> or <strong>free</strong> per day,
          nothing else. No clients, no venues, no pay. Send to bookers
          who keep asking &ldquo;are you free that night?&rdquo;
        </p>
      </div>

      {token && url ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={url}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="input flex-1 font-mono text-xs"
              aria-label="Public availability URL"
            />
            <button
              type="button"
              onClick={copyUrl}
              className="btn btn-md btn-primary shrink-0"
            >
              {copied ? "Copied ✓" : "Copy link"}
            </button>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
            <p>
              <strong className="text-slate-800">Recipients see:</strong>{" "}
              your monthly calendar with each day marked Free or Busy. Clicking
              a busy day shows the time ranges, e.g. &ldquo;4:00p – 9:00p
              Busy&rdquo;.
            </p>
            <p>
              <strong className="text-slate-800">They never see:</strong>{" "}
              client names, venues, pay, notes, or who you&rsquo;re working
              for.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
            >
              Preview as a recipient →
            </a>
            <button
              type="button"
              onClick={rotate}
              disabled={pending}
              className="text-xs text-slate-500 hover:text-red-700 transition-colors"
            >
              {pending ? "Rotating…" : "Rotate link"}
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={generate}
          disabled={pending}
          className="btn btn-md btn-primary"
        >
          {pending ? "Creating…" : "Create share link"}
        </button>
      )}

      {error && (
        <p
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
          role="alert"
        >
          {error}
        </p>
      )}
    </section>
  );
}
