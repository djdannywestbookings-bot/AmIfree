-- 0018_inquiries.sql
-- Inquiries table — visitors landing on /share/[token] can submit a
-- "looking to book you" message tied to a specific date. The owner
-- sees pending inquiries on /inquiries and can confirm (creates a
-- real booking) or decline.
--
-- This is a public-write surface, so RLS is restricted: anonymous
-- inserts are allowed for new pending rows (with the target_member
-- limited to a member that has a non-null availability_token), and
-- workspace members can read+update their own inquiries.
--
-- Idempotent: re-running is safe.

begin;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  target_member_id uuid not null references public.workspace_members(id) on delete cascade,

  -- Inquirer contact (the person reaching out)
  inquirer_name text not null,
  inquirer_email text not null,
  inquirer_phone text,

  -- Inquiry content
  requested_date date,           -- they may pick a specific date
  requested_time text,            -- free-form: "evening", "8pm", "all day"
  subject text,
  message text not null,

  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined', 'archived')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inquiries_target_member_idx
  on public.inquiries (target_member_id, status, created_at desc);

create index if not exists inquiries_workspace_idx
  on public.inquiries (workspace_id, status);

-- Updated_at trigger
create or replace function public.tg_inquiries_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at
  before update on public.inquiries
  for each row
  execute function public.tg_inquiries_set_updated_at();

-- RLS — public can insert (rate-limited at the action layer), members
-- can read/update their own inquiries.
alter table public.inquiries enable row level security;

drop policy if exists inquiries_anon_insert on public.inquiries;
create policy inquiries_anon_insert
  on public.inquiries for insert
  to anon
  with check (
    exists (
      select 1 from public.workspace_members m
      where m.id = target_member_id
        and m.availability_token is not null
        and m.status != 'disabled'
    )
  );

drop policy if exists inquiries_member_select on public.inquiries;
create policy inquiries_member_select
  on public.inquiries for select
  using (
    exists (
      select 1 from public.workspace_members m
      where m.id = target_member_id
        and m.user_id = auth.uid()
    )
    OR exists (
      select 1 from public.workspace_members m
      where m.workspace_id = inquiries.workspace_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

drop policy if exists inquiries_member_update on public.inquiries;
create policy inquiries_member_update
  on public.inquiries for update
  using (
    exists (
      select 1 from public.workspace_members m
      where m.id = target_member_id
        and m.user_id = auth.uid()
    )
    OR exists (
      select 1 from public.workspace_members m
      where m.workspace_id = inquiries.workspace_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

comment on table public.inquiries is
  'Public-facing inquiries posted via /share/[token]. Owner reviews '
  'on /inquiries and either confirms (creates a booking) or declines.';

commit;
