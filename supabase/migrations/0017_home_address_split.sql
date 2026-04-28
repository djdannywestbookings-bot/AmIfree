-- 0017_home_address_split.sql
-- Split workspace_members.home_address into discrete fields so the
-- profile UI can render street / city / state / zip separately and
-- so addresses can be passed cleanly into a maps URL for "Open in
-- Maps" on bookings.
--
-- The original `home_address` column stays — it's still used as the
-- street line. Three new columns join it.
--
-- Idempotent: re-running is safe.

begin;

alter table public.workspace_members
  add column if not exists home_city text,
  add column if not exists home_state text,
  add column if not exists home_zip text;

comment on column public.workspace_members.home_city is
  'City portion of the user-entered home address.';
comment on column public.workspace_members.home_state is
  'State / region portion of the user-entered home address.';
comment on column public.workspace_members.home_zip is
  'Postal/ZIP code portion of the user-entered home address.';

commit;
