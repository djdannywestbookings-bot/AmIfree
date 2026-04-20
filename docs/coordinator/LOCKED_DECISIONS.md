# Locked Decisions

Decisions locked during coordinator work. Do not revisit without explicit reason.

## Stack (per source-of-truth.md + Phase 22)
- Next.js App Router (not Vite, not Pages Router)
- React 19, TypeScript 5
- Supabase Postgres + Auth + Storage
- Graphile Worker (separate long-running process)
- OpenAI Responses API (adapter wired at foundation; flows in later phases)
- Tailwind CSS 3 (design tokens to port from archived Vite shell)
- Zod 4 for schema validation

## Explicitly NOT in stack
- Cloudflare Workers / wrangler (added then removed in Wave A slice 1)
- shadcn/ui (torn down before rebuild; may revisit later for specific primitives only)
- Next Pages Router

## Auth
- Supabase Auth with email OTP (not magic-link-only)
- Owner-only beta: `APP_ALLOWED_EMAILS` enforced server-side
- Roles: `dj_owner` active, `manager_lite` reserved scaffolding
- Default authenticated landing: `/agenda`
- No public signup, no self-serve invites

## Canonical routes (Phase 22)
- Public: `/login`, auth callbacks, `/api/health`
- Protected: `/agenda`, `/coverage`, `/intake`, `/settings`
- Agenda = Bookings only; Coverage = Shift Occurrences only (separation cannot blur)

## Repo layout (Phase 22 §Repo restructuring plan)
- `src/app/(public|app)/...` route groups
- `src/modules/{auth,bookings,availability-blocks,booking-requests,shift-occurrences,shift-templates,sharing,audit}/`
- `src/server/{db,repositories,services,policies}/`
- `src/lib/{supabase,config,openai,worker}/`
- `supabase/{migrations,seed,policies}/`
- `worker/{jobs,runner}/`
- `tests/{smoke,auth,routing}/`

## Environments
- `local` / `preview` / `private-beta-production`
- Separate Supabase projects per env
- No `.env.local` in git; platform-managed secrets in non-local

## Reserved load-bearing surfaces
- `schedule_commitments` as first-class normalized backend overlap surface (schema reservation due Wave C slice 10)
- Graphile Worker runs as a separate process from the Next host (worker host ≠ Vercel)

## Process
- One slice = one commit
- Build must pass before any commit
- Git ops run from owner's own terminal (sandbox mount can create but not delete; stale `.lock` files otherwise)
