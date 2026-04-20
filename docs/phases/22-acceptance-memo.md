# [22] Phase — Canonical Beta Foundation — Acceptance Memo

_Completed: 2026-04-20 on `feat/v0.1-rebuild`_

This memo audits each of the 14 Definition-of-Done items from
`docs/phases/22-canonical-beta-foundation.md` §Definition of done against
the state of the branch. It is the merge gate.

## DoD audit

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Next.js App Router app is the primary runtime | ✅ | `src/app/` at repo root; slice 3 (`0ace296`) |
| 2 | Prior Vite/static shell removed from live path; archived | ✅ | `archive/vite-shell/`; slice 2 (`f8473cd`) |
| 3 | Live app is deployable online from the repo | ⚠️ documented; execution owed | `vercel.json` + `docs/ops/deploy-runbook.md`; slice 15 (`11d1659`). See Gaps. |
| 4 | Owner-only auth works against Supabase Auth | ✅ | Email OTP; slice 7 (`59a408f`) + slice 7-patch (`a10122b`). Smoke-tested 2026-04-20. |
| 5 | Unauthenticated users cannot access protected routes | ✅ | `src/middleware.ts` + `src/app/(app)/layout.tsx` defense-in-depth; slice 7 + 8 |
| 6 | Authenticated owner can sign in and reach a protected shell | ✅ locally; ⚠️ online pending deploy | Smoke test passed end-to-end on localhost 2026-04-20. |
| 7 | Protected shell includes Agenda / Coverage / Intake / Settings | ✅ | `src/app/(app)/layout.tsx` nav; slice 8 (`1ead658`) |
| 8 | Route structure preserves Agenda/Coverage separation | ✅ | `(app)/agenda/` and `(app)/coverage/` each with page copy enforcing scope; slice 8 |
| 9 | Env vars and secrets defined for local and private-beta | ✅ | `.env.local.example` (local); `docs/ops/deploy-runbook.md` env-var matrix (private-beta); slices 5 + 15 |
| 10 | Database connectivity wired server-side | ✅ | `src/lib/supabase/{browser,server,admin}.ts`; slice 6 (`c6bb6ae`) |
| 11 | Graphile Worker runtime defined and deployable as a separate process | ✅ | `worker/runner/index.ts`; runbook covers Railway; slice 11 (`7b5ceb6`) + slice 15 |
| 12 | OpenAI server adapter/config wired at infrastructure level | ✅ | `src/lib/openai/client.ts` lazy-init; slice 12 (`bebbb11`) |
| 13 | PWA manifest/install baseline exists and is valid | ✅ | `public/manifest.webmanifest`, `public/icon.svg`, `viewport` export in `src/app/layout.tsx`; slice 14 (`bad06cc`) |
| 14 | Health/status checks exist | ✅ | `/api/health` returning booleans for app / auth / worker / database; slice 13 (`163a395`) |

## Gaps blocking branch merge

1. **#3 / #6 — actual deployment.** Runbook + config exist but the owner has not yet executed the Vercel + Railway + `amifree-prod` Supabase setup. DoD item 3 says "deployable online," which is satisfied by config-readiness; DoD item 6 says "can sign in and reach a protected shell online," which strictly requires a live deploy. Conservative read: execute the runbook before merging `feat/v0.1-rebuild` to `main`.

2. **Slice 10 migration not applied.** `supabase/migrations/0001_reserve_schedule_commitments.sql` is committed but has not been run against `amifree-dev`. Non-blocking for DoD (no DoD item requires the migration to be applied), but the health endpoint's database check currently passes without exercising the table. Apply before promoting to `amifree-prod`.

## Open risks to track into Phase 23

- Dev database password and `service_role` key were exposed via chat transcript 2026-04-20. Rotation deferred by owner; rotate before any external surface exists.
- Preview deploys disabled; re-evaluate once an ephemeral Supabase project strategy exists.
- Supabase built-in SMTP for OTP email; deliverability adequate for single-owner dev but will need Resend/Postmark before wider rollout.
- Tailwind tokens from `archive/vite-shell/` not yet ported to the new `tailwind.config.ts`. Placeholder pages use default palette.
- Custom domain not yet configured; Phase 22 beta runs on default Vercel URL.

## Sign-off

Phase 22 code foundation: ✅ complete.
Phase 22 operational acceptance: ⚠️ complete upon runbook execution by owner.

Once the owner confirms live `amifree.vercel.app` (or equivalent) end-to-end sign-in against `amifree-prod`, `feat/v0.1-rebuild` is ready to merge to `main`.

Phase 23 can begin planning immediately; runtime, auth, deployment, and directory structure are settled.
