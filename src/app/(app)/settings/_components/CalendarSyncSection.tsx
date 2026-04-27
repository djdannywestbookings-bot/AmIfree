"use client";

import { useState } from "react";
import { rotateCalendarTokenAction } from "../calendar-actions";

/**
 * Calendar sync section — Phase 34.
 *
 * Shows the user's iCal subscription URL with a copy button + step
 * lists for Google / Apple / Outlook. Includes a rotate button so
 * the URL can be invalidated if leaked.
 */
export function CalendarSyncSection({
  initialToken,
  baseUrl,
}: {
  initialToken: string;
  baseUrl: string;
}) {
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const url = `${baseUrl}/api/calendar/${token}`;
  const webcalUrl = url.replace(/^https?:/, "webcal:");

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy. Select the URL and press ⌘C / Ctrl+C.");
    }
  }

  async function rotate() {
    if (
      !window.confirm(
        "Generate a new URL? The old one stops working — you'll need to re-subscribe in your calendar app.",
      )
    ) {
      return;
    }
    setRotating(true);
    setError(null);
    const result = await rotateCalendarTokenAction();
    setRotating(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setToken(result.newToken);
  }

  return (
    <section className="space-y-4 border border-neutral-200 rounded-md p-5 bg-white">
      <div>
        <h2 className="text-lg font-semibold text-indigo-700">
          Calendar sync
        </h2>
        <p className="text-sm text-neutral-600 mt-1">
          Subscribe to your AmIFree schedule in Google Calendar, Apple
          Calendar, or Outlook. Bookings show up alongside everything else
          on your calendar and update automatically when they change.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-neutral-700">
          Your subscription URL
        </label>
        <div className="flex items-stretch gap-2">
          <input
            readOnly
            value={url}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="flex-1 rounded border border-neutral-300 px-3 py-1.5 text-xs font-mono bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={copyUrl}
            className="rounded bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-sm whitespace-nowrap"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        <p className="text-[11px] text-neutral-500">
          Treat this URL like a secret — anyone with it can read your
          schedule. Rotate it if you accidentally share it.
        </p>
      </div>

      <details className="rounded border border-neutral-200 p-3 text-sm">
        <summary className="cursor-pointer font-medium text-neutral-700">
          How to subscribe
        </summary>
        <div className="mt-3 space-y-4 text-sm text-neutral-700">
          <div>
            <h3 className="font-medium text-indigo-700 mb-1">
              Google Calendar (web)
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-neutral-600">
              <li>
                Open{" "}
                <a
                  href="https://calendar.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline"
                >
                  calendar.google.com
                </a>
              </li>
              <li>
                In the left sidebar, click the <strong>+</strong> next to
                &quot;Other calendars&quot; → <strong>From URL</strong>
              </li>
              <li>Paste the URL above and click <strong>Add calendar</strong></li>
              <li>
                Google polls every few hours. New bookings show up
                automatically.
              </li>
            </ol>
          </div>
          <div>
            <h3 className="font-medium text-indigo-700 mb-1">
              Apple Calendar (Mac / iPhone)
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-neutral-600">
              <li>
                On Mac: <strong>File → New Calendar Subscription</strong>,
                paste the URL.
              </li>
              <li>
                On iPhone:{" "}
                <a
                  href={webcalUrl}
                  className="text-indigo-600 underline"
                >
                  Tap here to subscribe
                </a>{" "}
                (opens Calendar with the URL pre-filled).
              </li>
              <li>Set Auto-refresh to <strong>Every Hour</strong>.</li>
            </ol>
          </div>
          <div>
            <h3 className="font-medium text-indigo-700 mb-1">Outlook</h3>
            <ol className="list-decimal list-inside space-y-1 text-neutral-600">
              <li>
                Outlook on the web → <strong>Add calendar</strong> →{" "}
                <strong>Subscribe from web</strong>
              </li>
              <li>Paste the URL, give it a name, save.</li>
            </ol>
          </div>
        </div>
      </details>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-neutral-200">
        <p className="text-xs text-neutral-500">
          If you accidentally shared the URL, generate a new one. The old
          URL stops working right away.
        </p>
        <button
          type="button"
          onClick={rotate}
          disabled={rotating}
          className="text-xs rounded border border-amber-300 bg-amber-50 text-amber-800 px-3 py-1.5 hover:bg-amber-100 disabled:opacity-50 whitespace-nowrap"
        >
          {rotating ? "Rotating…" : "Generate new URL"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
