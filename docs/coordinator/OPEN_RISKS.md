# Open Risks

_Updated at Phase 22 acceptance (slice 16). See `docs/phases/22-acceptance-memo.md` for sign-off status._

## Phase 22 merge blockers
- **Runbook not yet executed.** `docs/ops/deploy-runbook.md` describes the full Vercel + Railway + `amifree-prod` Supabase setup, but the owner has not run it. DoD items 3 and 6 are conservatively conditional on this being done before merging `feat/v0.1-rebuild` to `main`.

## Infrastructure to close after merge
- **Slice 10 migration applied to `amifree-dev`** 2026-04-20. Re-apply to `amifree-prod` when that project is created per the deploy runbook.
- **Worker database connection string swapped** 2026-04-20 to the Session pooler URI (port 5432) in `.env.local`. Graphile Worker LISTEN/NOTIFY requirement satisfied.

## Security hygiene
- **Database password rotated** 2026-04-20 on `amifree-dev`; new value lives in `.env.local` only.
- **`service_role` key rotation deferred.** Supabase's current architecture doesn't expose a one-click rotation for legacy `service_role` keys; rotation requires migrating to the new `sb_publishable_` / `sb_secret_` API keys plus a compatibility check on `@supabase/ssr@0.10.2`. The original leaked key remains active on `amifree-dev`. Mitigations: (1) project is dev-only, (2) owner-only access, (3) no production data yet. Track alongside the broader SDK-compat decision before `amifree-prod` provisioning — rotating at that point is cheaper than doing it twice.

## Operational choices explicitly deferred
- **Preview deploys disabled.** Re-evaluate once an ephemeral Supabase project strategy exists that keeps preview writes off live owner data.
- **SMTP: Supabase built-in.** Adequate for single-owner dev; swap to Resend or Postmark on first deliverability failure in prod. Phase 22 acceptable, production acceptable only while single-owner.
- **Supabase legacy keys.** Using `anon` / `service_role` JWT keys. New `publishable` / `secret` keys exist in the dashboard but are not confirmed compatible with `@supabase/ssr@0.10.2`. Migrate when the SDK declares support.
- **Custom domain.** Private beta runs on default Vercel URL. Revisit when public surface is planned.

## Product-shaped debt (non-blocking for Phase 22)
- **Tailwind tokens from `archive/vite-shell/` not ported** into the new `tailwind.config.ts`. Placeholder pages use default Tailwind palette. Port before real UI lands.
- **PWA icons are SVG-only.** Manifest references `/icon.svg`. Some install surfaces prefer raster PNGs at 192/512; generate a proper set before public surfacing.
- **No custom SMTP observability.** `ERROR_TRACKING_DSN` and `LOG_DRAIN_URL` env vars are defined but unwired. Wire in a later phase when a provider is chosen.

## Process friction (won't self-correct)
- **Cowork sandbox cannot delete files.** Git ops from the sandbox leave stale `.git/*.lock` files. Owner runs all git commands from their own terminal and clears locks first. Persistent but understood workaround.
