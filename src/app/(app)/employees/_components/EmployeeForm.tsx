"use client";

import { useState, type FormEvent } from "react";
import { createEmployeeAction, updateEmployeeAction } from "../actions";
import type { WorkspaceMemberRow } from "@/modules/auth";
import { APP_ROLES } from "@/server/policies/roles";
import { MEMBER_STATUSES } from "@/modules/auth";

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner — full workspace authority",
  manager_lite: "Manager — manage shifts + venues",
  employee: "Employee — view + be assigned shifts",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending — invited, not signed in yet",
  joined: "Joined — has access",
  disabled: "Disabled — access revoked",
};

/**
 * Reusable employee form. Create mode (no `existing`) or edit mode.
 *
 * Owner can change role and status on edit. Email is read-only on
 * edit so we don't break the email-based invite attachment if the
 * row is still pending.
 */
export function EmployeeForm({ existing }: { existing?: WorkspaceMemberRow }) {
  const isEdit = Boolean(existing);
  const [email, setEmail] = useState(existing?.email ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [role, setRole] = useState(existing?.role ?? "employee");
  const [status, setStatus] = useState(existing?.status ?? "joined");
  // Display rate as USD with 2-decimal string for input ergonomics;
  // we convert to cents on submit.
  const [payRateUsd, setPayRateUsd] = useState(
    existing?.default_pay_rate_cents
      ? (existing.default_pay_rate_cents / 100).toFixed(2)
      : "",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwnerRow = existing?.role === "owner";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData();
    form.set("email", email);
    form.set("name", name);
    if (phone) form.set("phone", phone);
    form.set("role", role);
    if (payRateUsd) form.set("default_pay_rate_cents", payRateUsd);

    if (isEdit && existing) {
      form.set("id", existing.id);
      form.set("status", status);
      const result = await updateEmployeeAction(form);
      setPending(false);
      if (result && !result.ok) setError(result.error);
      return;
    }

    const result = await createEmployeeAction(form);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEmail("");
    setName("");
    setPhone("");
    setRole("employee");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border border-neutral-200 rounded-md p-4 bg-white"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Email {isEdit && <span className="text-neutral-400">(can&apos;t change after invite)</span>}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            readOnly={isEdit}
            maxLength={254}
            placeholder="employee@example.com"
            className={`w-full rounded border border-neutral-300 px-3 py-2 text-sm ${isEdit ? "bg-neutral-50" : ""}`}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Phone (optional)
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={60}
            placeholder="(555) 555-5555"
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Pay rate (USD/hour)
          </span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
              $
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={payRateUsd}
              onChange={(e) => setPayRateUsd(e.target.value)}
              placeholder="0.00"
              className="w-full rounded border border-neutral-300 pl-7 pr-3 py-2 text-sm"
            />
          </div>
        </label>
      </div>

      <label className="block">
        <span className="block text-xs font-medium text-neutral-700 mb-1">
          Role
        </span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
          disabled={isOwnerRow}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm bg-white disabled:bg-neutral-50"
        >
          {APP_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r] ?? r}
            </option>
          ))}
        </select>
        {isOwnerRow && (
          <span className="block text-[11px] text-neutral-500 mt-1">
            The workspace owner&apos;s role can&apos;t be changed here.
          </span>
        )}
      </label>

      {isEdit && (
        <label className="block">
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            disabled={isOwnerRow}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm bg-white disabled:bg-neutral-50"
          >
            {MEMBER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s] ?? s}
              </option>
            ))}
          </select>
        </label>
      )}

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 text-sm disabled:opacity-50 transition-colors"
        >
          {pending ? (isEdit ? "Saving…" : "Inviting…") : isEdit ? "Save changes" : "Invite employee"}
        </button>
        <a
          href="/employees"
          className="text-xs rounded border border-neutral-300 py-2 px-4 hover:bg-neutral-50"
        >
          Cancel
        </a>
      </div>

      {!isEdit && (
        <p className="text-xs text-neutral-500 pt-1 border-t border-neutral-200 mt-2">
          They&apos;ll show up as <strong>Pending</strong> until they sign
          in at <span className="font-mono">am-ifree.vercel.app/login</span>{" "}
          using this email. They&apos;ll get a 6-digit code by email and
          land in the workspace once verified.
        </p>
      )}
    </form>
  );
}
