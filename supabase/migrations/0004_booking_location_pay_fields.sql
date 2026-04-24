-- 0004_booking_location_pay_fields.sql
-- Phase 24C.1 — split booking free-form metadata into structured fields.
--
-- Phase 24C shipped bookings with a single `notes` column for everything
-- that wasn't title/status/time. Owner feedback: cramming location,
-- pay, and commentary into one text field is ugly and hard to scan.
--
-- This migration adds two optional text columns alongside `notes`:
--   location     — venue name + address or any place string
--   pay          — "$300", "300 + tips", "TBD", any free-form pay hint
--
-- Both are text (not jsonb / numeric) because Phase 24C.1 keeps the
-- input flexible. A later phase can upgrade `pay` to a numeric cents
-- column with a separate `pay_notes` column once the cost of strict
-- typing is worth the UX constraint.
--
-- Structured fields for contact (name/email/phone), client linkage,
-- and travel buffer are deferred to later phases.

begin;

alter table public.bookings
  add column if not exists location text null,
  add column if not exists pay text null;

comment on column public.bookings.location is
  'Freeform location string. Venue name, address, or both. Structured '
  'venue linkage comes in a later phase.';

comment on column public.bookings.pay is
  'Freeform pay string. Numeric formalization deferred to a later phase.';

commit;
