-- 0011_employee_pay_rate.sql
-- Phase 41 — Pay rates + labor stats bar.
--
-- Adds a per-employee default pay rate (cents per hour) so the
-- Schedule view can compute estimated wages for any date range.
-- Stored in cents to avoid floating-point drift.
--
-- Per-shift overrides are deferred — the existing bookings.pay
-- text field already lets owners record one-off rates ("$300 +
-- tips", "TBD") for unstructured cases. The structured stats bar
-- uses the employee's default rate × scheduled hours for each
-- assigned booking; unassigned shifts contribute hours but $0
-- wages until someone is assigned.

begin;

alter table public.workspace_members
  add column if not exists default_pay_rate_cents integer not null default 0
    check (default_pay_rate_cents >= 0);

comment on column public.workspace_members.default_pay_rate_cents is
  'Pay rate per scheduled hour, in USD cents. 0 means unset (the '
  'stats bar will treat their hours as $0 wages). Edit on the '
  'employee profile page.';

commit;
