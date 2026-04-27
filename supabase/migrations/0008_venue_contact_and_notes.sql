-- 0008_venue_contact_and_notes.sql
-- Phase 37 — Richer venue details: contact + notes.
--
-- Phase 28 stored only name + address + color per venue. Owner workflow
-- needs more: who do you call at this venue (security manager, GM,
-- promoter)? What's the deal you have with them (door split, parking,
-- house engineer)? Free-form notes capture the operational stuff that
-- never quite fits a structured field.
--
-- We don't store coordinates yet — the map preview uses Google's embed
-- URL which only needs the address string. If we ever add geo search
-- ("show venues within 20mi of an inquiry") we can backfill lat/lng.

begin;

alter table public.venues
  add column if not exists contact_name text,
  add column if not exists contact_phone text,
  add column if not exists notes text;

comment on column public.venues.contact_name is
  'Person to reach out to at this venue (security, GM, promoter, etc.).';
comment on column public.venues.contact_phone is
  'Phone for the venue contact. Free-form to allow extensions and notes.';
comment on column public.venues.notes is
  'Free-form notes about working with this venue — load-in, parking, '
  'door splits, house engineer name, anything that helps next time.';

commit;
