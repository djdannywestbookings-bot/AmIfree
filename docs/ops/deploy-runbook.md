# Deploy Runbook — AmIFree Private Beta

_Phase 22 Wave D slice 15. Supersedes inline deploy notes elsewhere._

## Target topology

Three environments per Phase 22 §Environment and secrets plan:

| env | Next host | Worker host | Supabase project |
|---|---|---|---|
| `local` | `npm run dev` | `npm run worker:dev` | `amifree-dev` |
| `preview` | disabled in Phase 22 | — | — |
| `private-beta-production` | Vercel | Railway | `amifree-prod` (create during this runbook) |

Rationale:
- Vercel: managed Next.js host, free tier sufficient for private beta, no worker-process capability — that's why worker goes elsewhere.
- Railway: low-friction long-running process host, free/hobby tier supports a single Graphile Worker.
- Fly.io is the documented fallback if Railway's free tier or policies don't fit.
- Preview deploys disabled in Phase 22 because Vercel previews against live Supabase would cross-contaminate owner data; re-enable once a third ephemeral Supabase project can be wired cleanly.

## One-time setup

### 1. Create `amifree-prod` Supabase project

- supabase.com → New project → name `amifree-prod`, same region as `amifree-dev` unless there's a reason to diverge, record the database password in a password manager.
- Enable email auth under Authentication → Providers → Email.
- Paste the body of `supabase/migrations/0001_reserve_schedule_commitments.sql` into Authentication → SQL Editor → Run (one-time; future migrations apply via Supabase CLI).
- Edit the Magic Link email template under Authentication → Email Templates → Magic link — use the same template as `amifree-dev` (includes `{{ .Token }}` so OTP delivers correctly).
- Copy the Legacy anon + service_role keys from Settings → API → Legacy tab.
- Copy the Transaction pooler URI from Settings → Database → Connection string (for `DATABASE_URL`).
- Copy the Session pooler URI (for `GRAPHILE_WORKER_DATABASE_URL`; Transaction pooler does not proxy LISTEN/NOTIFY).

### 2. Deploy Next app to Vercel

- vercel.com → Add New Project → import from GitHub (push `feat/v0.1-rebuild` or a `main` merge first; slice 16 acceptance decides the merge timing).
- Root directory: repo root (Vercel will pick up `vercel.json` automatically).
- Framework preset: Next.js (auto-detected).
- Environment variables (Production scope only; do not mirror to Preview):

  | key | value source |
  |---|---|
  | `NEXT_PUBLIC_APP_URL` | the Vercel deployment URL (e.g. `https://amifree.vercel.app`) |
  | `NEXT_PUBLIC_SUPABASE_URL` | `amifree-prod` Project URL |
  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `amifree-prod` anon key |
  | `SUPABASE_SERVICE_ROLE_KEY` | `amifree-prod` service_role key |
  | `SUPABASE_PROJECT_ID` | `amifree-prod` project ref |
  | `DATABASE_URL` | `amifree-prod` Transaction pooler URI (password substituted) |
  | `GRAPHILE_WORKER_DATABASE_URL` | `amifree-prod` Session pooler URI (password substituted) |
  | `GRAPHILE_WORKER_SCHEMA` | `graphile_worker` |
  | `WORKER_CONCURRENCY` | `5` |
  | `APP_ENV` | `private_beta` |
  | `APP_ALLOWED_EMAILS` | owner email(s), comma-separated |
  | `OPENAI_API_KEY` | optional in Phase 22; leave blank |
  | `ERROR_TRACKING_DSN` / `LOG_DRAIN_URL` / `DEPLOYMENT_LABEL` | optional |

- Preview deployments: **disable** for Phase 22. Project Settings → Git → Ignored Build Step: set a command that skips preview builds, or disable the GitHub integration for non-`main` branches.
- Deploy. Confirm `/api/health` returns `{"ok":true,"env":"private_beta","checks":{...}}` over HTTPS.

### 3. Deploy Graphile Worker to Railway

- railway.com → New Project → Deploy from GitHub → select the AmIFree repo.
- Service: name `amifree-worker`.
- Build command: `npm install`
- Start command: `npx tsx worker/runner/index.ts` (or add an npm script `"worker:start": "tsx worker/runner/index.ts"` if preferred; current `worker:dev` is fine for dev/prod parity at this scale).
- Environment variables — paste the same server-only set from the Vercel table above. `NEXT_PUBLIC_*` values are not needed on the worker service unless they end up imported transitively through shared modules; include them to be safe.
- Deploy. Tail the logs: `Graphile Worker started (schema=graphile_worker, concurrency=5)`.

### 4. Smoke test production

- Visit the Vercel URL → `/login`.
- Sign in with an `APP_ALLOWED_EMAILS`-listed email.
- Confirm the OTP email arrives (template matches dev).
- Land on `/agenda`, navigate Coverage / Intake / Settings, sign out.
- Hit `/api/health` — expect `ok:true` on all four checks.

## Secret handling

- Never commit real secrets. `.env.local` is gitignored.
- Vercel and Railway manage encrypted secrets internally. Do not export them back into `.env.local.example`.
- Rotation: whenever a secret is suspected exposed, rotate in the originating dashboard first (Supabase / OpenAI / etc.) then update Vercel + Railway.
- The original `amifree-dev` database password and `service_role` key leaked via chat in the dev session. Rotate both before promoting any of this infrastructure to real owner use.

## Ongoing operations

- Deploys ride GitHub pushes to `main` (after `feat/v0.1-rebuild` merges).
- Supabase migrations run via Supabase CLI: `supabase db push` against the linked project. Pre-merge, run against `amifree-dev` only.
- Logs: Vercel for web, Railway for worker, Supabase for database + auth.
- Observability hooks (`ERROR_TRACKING_DSN`, `LOG_DRAIN_URL`) land in a later phase.

## Known deviations from Phase 22 defaults

- Preview environment not created. Phase 22 acknowledges this is acceptable if preview can't be isolated from live data.
- Custom SMTP not configured. Supabase built-in is rate-limited and not recommended for production; swap to Resend or Postmark the first time owner gets a delivery failure.
- Single owner on allowlist. Multi-owner and Manager Lite expansion live in Phase 23+.
