-- 0019_subscriptions.sql
-- Stripe subscriptions table — one row per active workspace
-- subscription. Source of truth is Stripe; this row is a denormalized
-- mirror updated by the /api/webhooks/stripe handler on every
-- customer.subscription.* event.
--
-- Idempotent: re-running is safe.

begin;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,

  -- Stripe-side ids
  stripe_customer_id text not null,
  stripe_subscription_id text not null,
  stripe_price_id text not null,

  -- Lifecycle. Mirrors Stripe's subscription.status enum so the
  -- isPro() helper can do a simple "is it in an active set" check.
  -- Possible values per Stripe docs: trialing, active, past_due,
  -- canceled, unpaid, incomplete, incomplete_expired, paused.
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_stripe_subscription_id_unique
  on public.subscriptions (stripe_subscription_id);
create index if not exists subscriptions_workspace_idx
  on public.subscriptions (workspace_id);
create index if not exists subscriptions_status_idx
  on public.subscriptions (status);

-- Updated_at trigger
create or replace function public.tg_subscriptions_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row
  execute function public.tg_subscriptions_set_updated_at();

-- RLS — only workspace members can read; webhook writes through admin
-- client so writes don't go through these policies.
alter table public.subscriptions enable row level security;

drop policy if exists subscriptions_member_select on public.subscriptions;
create policy subscriptions_member_select
  on public.subscriptions for select
  using (
    exists (
      select 1 from public.workspace_members m
      where m.workspace_id = subscriptions.workspace_id
        and m.user_id = auth.uid()
    )
  );

comment on table public.subscriptions is
  'Denormalized mirror of Stripe subscription state. Updated by the '
  '/api/webhooks/stripe handler on customer.subscription.* events.';

commit;
