# Execution Log

## Branch: feat/v0.1-rebuild (from feat/mvp-shell)

### Pre-rebuild prep (on feat/mvp-shell)
- `248c5e9` Tear down shadcn scaffold; rewrite README as SPA prototype

### Support (on feat/v0.1-rebuild, before slice 1)
- `3d346dd` chore: add wrangler 4.84.0 as devDependency — superseded by slice 1
- `c53d91c` docs: add v0.1 rebuild execution plan

### Wave A — Repo restructure
- `b386cf2` Slice 1: uninstall wrangler (not in locked stack)
- `f8473cd` Slice 2: archive Vite SPA to `archive/vite-shell/` (30 files renamed via git mv, 100% similarity)
- `0ace296` Slice 3: scaffold Next.js App Router at repo root (Next 15 + React 19 + TS 5 + Tailwind 3)
- `a4d3bd2` Slice 4: canonical folder structure (16 barrels + 14 .gitkeep placeholders)

### Wave B — Config + Auth + Shell
- `8fe4f3f` Slice 5: config loader (env.server + env.public zod-validated) + `.env.local.example`
- `c6bb6ae` Slice 6: Supabase clients (browser / server / admin)
- `59a408f` Slice 7: owner-only email OTP auth — middleware, login page, server actions, `/agenda` placeholder
- `1ead658` Slice 8: protected shell — `(app)/layout.tsx`, Coverage / Intake / Settings placeholders, loading + error boundaries, Settings sign-out
- `d927c58` Slice 9: role scaffolding — `roles.ts` (dj_owner active, manager_lite reserved), `current-actor.ts`, layout refactor
- `5d9508e` Coordinator control documents added (master brief, locked decisions, open risks, asset index, next task, execution log)

### Wave B post-smoke-test
- `a10122b` Slice 7 patch: accept 6–10 digit OTPs (Supabase default is 8, not 6). Root cause diagnosed via Cowork browser inspection of Supabase mail logs, which revealed `"mail_type": "magic_link"` — template required `{{ .Token }}` update plus app-side digit-length flex.

### Wave C — Backend foundation
- `b13abf5` Slice 10: reserve `schedule_commitments` as normalized overlap surface (SQL migration file; not yet applied)
- `7b5ceb6` Slice 11: Graphile Worker runtime (runner, `noop` job, `enqueueJob` adapter) + `worker:dev` script
- `bebbb11` Slice 12: OpenAI adapter (lazy-init, server-only)
- `163a395` Slice 13: `/api/health` with app / auth / worker / database booleans

### Wave D — PWA + deploy + acceptance
- `bad06cc` Slice 14: PWA baseline (manifest + SVG icon + viewport meta). Service worker explicitly deferred.
- `11d1659` Slice 15: deploy runbook (`docs/ops/deploy-runbook.md`) + `vercel.json`. Vercel + Railway + `amifree-prod` Supabase topology documented; actual provisioning left to owner execution.
- _slice 16 commit_: Phase 22 DoD acceptance memo + coordinator doc refresh.

### Validated end-to-end on localhost (2026-04-20)
- Sign-in flow: email → OTP → `/agenda` → navigate Coverage / Intake / Settings → sign out → redirect to `/login`. Middleware gating confirmed both directions.
- Build clean on every commit. No lint errors, no type errors.

### Notable snags during execution
- Sandbox filesystem mount cannot delete files → every git op from sandbox left stale `.lock` files. Resolved by owner running git ops from own terminal and clearing locks first.
- Supabase rolled out new `publishable` / `secret` API keys; `@supabase/ssr@0.10.2` still uses legacy. Pointed at Legacy tab.
- Next.js inferred `~/pnpm-lock.yaml` as workspace root. Fixed by pinning `outputFileTracingRoot: __dirname` in `next.config.ts`.
- Initial `npm install -g wrangler` hit EACCES on `/usr/local/lib/node_modules` (system Node owned by root). Switched to devDependency install, then removed entirely in slice 1.
- Supabase Magic Link email template defaulted to link-only, no `{{ .Token }}`. Updated via Cowork browser automation during slice 7 triage.
- Supabase project ships with 8-digit OTPs; app had hard-coded 6. Fixed in slice 7 patch.
- Owner pasted database password and `service_role` key into chat. Rotation deferred.

### Phase 22 status
✅ Code complete. ⚠️ Operational acceptance pending owner execution of `docs/ops/deploy-runbook.md` and the `NEXT_TASK.md` checklist.
