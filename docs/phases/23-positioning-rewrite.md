# [23] Phase — Positioning Rewrite

_Landed 2026-04-24. Doc-only phase; no feature code shipped._

## Why this phase existed

Phase 22 shipped a live beta foundation at `am-ifree.vercel.app` with
Vercel + Railway + `amifree-prod` Supabase. At the same time, an audit
in `docs/coordinator/SESSION_2026-04-24.md` surfaced a contradiction
between what the repo's planning docs said (DJ-first, nightlife-focused,
Intake DJ / Manager Lite only) and what the owner actually wanted to
build (booking platform for any service provider who takes bookings
from clients — entertainment, photography, fitness, beauty, tutoring,
coaching, any calendar-driven service business).

Four decisions were locked in that audit:

- **D1** — Keep the Next.js + Supabase foundation. Abandon the earlier
  Vite + Cloudflare plan.
- **D2** — Broaden audience from DJ-first to any service provider +
  client booking.
- **D3** — Nightlife-day semantics survive as a workspace-level
  `service_day_mode` setting (`"standard"` default, `"nightlife"`
  available).
- **D4** — Finish Phase 22 acceptance before any new feature work.

Phase 22 shipped. D4 is satisfied. Phase 23 applies D2 and D3 to the
planning-doc layer before any Phase 24 feature code inherits the old
mental model.

## Scope

**In scope:**
- Rewrite `docs/source-of-truth.md` — broaden primary audience,
  neutralize role language, add `service_day_mode` to locked technical
  truths, update phase status.
- Update `docs/coordinator/MASTER_BRIEF.md` — neutral one-liner,
  refreshed phase pointers.
- Update `docs/roadmap.md` — mark Phase 22 shipped, mark Phase 23
  complete, update intake scope language.
- Rename role `dj_owner` → `owner` in `src/server/policies/roles.ts`
  and `src/server/policies/current-actor.ts`. Safe because no RLS
  policies reference it yet.

**Out of scope (explicitly, to keep this phase small):**
- Rewriting historical phase docs (1 through 22, plus 26, 27, 29).
  Those are frozen records of the planning arc that produced the
  current state; they do not serve as live spec going forward.
- Database schema additions for `service_day_mode` or workspace
  settings. The setting is declared in `source-of-truth.md` as a locked
  technical truth; schema lands when Phase 24+ needs it.
- UI work for the onboarding choice between `"standard"` and
  `"nightlife"` workspaces. Phase 24 owner direction will decide
  whether this belongs in the first feature slice.
- Role rename cascade into RLS policies. No RLS policies exist yet;
  when they're written, they'll use `owner`.

## What changed in this commit

- `docs/source-of-truth.md` — substantial rewrite of project identity,
  locked core product truths, locked technical truths, locked role
  truths, and current execution status. Added a "Historical note"
  paragraph linking to this doc.
- `docs/coordinator/MASTER_BRIEF.md` — dropped "DJ-first" one-liner;
  pointed at Phase 23 as current phase; added
  `docs/coordinator/SESSION_2026-04-24.md` as a live source of truth.
- `docs/roadmap.md` — Phase 22 marked shipped with tag reference;
  Phase 23 filled in (no longer an UNRESOLVED GAP); intake scope line
  neutralized.
- `src/server/policies/roles.ts` — `APP_ROLES`, `ACTIVE_ROLES` updated
  from `dj_owner` to `owner`. Comment block explains rename history.
- `src/server/policies/current-actor.ts` — `getCurrentActor` now
  returns `role: "owner"`. Comment block updated.

## What did NOT change

- Database rows, Supabase Auth configuration, env vars, deploy topology,
  or any runtime behavior. The role name is an app-level value that
  isn't stored anywhere (Phase 22's role resolution is computed on
  every request). Users sign in the same way and land on the same
  `/agenda` placeholder.
- Historical phase docs. Phase 7, 10, 12, 14, 15, etc. still say
  "DJ-first" and "DJ / Manager Lite only" in places. Those are
  recorded history, not live spec; the header note on
  `source-of-truth.md` makes the supersession explicit so a reader of
  the older docs knows where to go.

## Definition of done

- [x] `docs/source-of-truth.md` no longer says "Product is DJ-first"
      as a locked truth.
- [x] `docs/source-of-truth.md` declares `service_day_mode` as a
      workspace-level locked technical truth.
- [x] `docs/coordinator/MASTER_BRIEF.md` opens with the broadened
      positioning.
- [x] `docs/roadmap.md` reflects Phase 22 shipped and Phase 23 complete.
- [x] `src/server/policies/roles.ts` exports `APP_ROLES = ["owner",
      "manager_lite"]` (no `dj_owner`).
- [x] `src/server/policies/current-actor.ts` returns `role: "owner"`.
- [x] `grep -r "dj_owner" src/` returns only comments documenting the
      rename history (no live code uses the old name).
- [x] This phase doc exists at `docs/phases/23-positioning-rewrite.md`.

## What this unblocks

Phase 24 can now be scoped against correct language. When the first
feature lands (likely bookings CRUD or intake pipeline, per owner
direction), the schema, component names, copy, and API endpoints can
use neutral terminology without a rename cascade later.

## Related documents

- `docs/coordinator/SESSION_2026-04-24.md` — the audit that produced
  D1–D4.
- `docs/source-of-truth.md` — live spec.
- `docs/phases/22-canonical-beta-foundation.md` — what shipped before
  this rewrite.
- `docs/phases/22-acceptance-memo.md` — Phase 22 DoD audit.
