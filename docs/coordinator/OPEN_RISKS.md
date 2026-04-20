# Open Risks

## Verification debt
- **Sign-in smoke test not yet run.** Build passes, middleware registers, but real OTP delivery + verification not yet exercised end-to-end. Owner action required before Wave C lands.

## Security hygiene
- **Leaked credentials.** Database password and Supabase `service_role` key were pasted into chat transcript by owner. Owner deferred rotation until post-Phase-22. Mitigation owed: rotate both; update `.env.local` (local) and platform-managed secrets (preview / prod) to match.

## Environment topology
- Preview and private-beta-production Supabase projects not yet created. Deferred to slice 15 (deploy). Phase 22 DoD requires env separation before merge.
- Preview deployments must be isolated from live owner data or disabled. Decision owed at slice 15.

## Worker hosting
- Graphile Worker needs a persistent host. Vercel alone does not satisfy. Worker host decision (Fly / Railway / Render / other) owed at slice 11 or 15. Flagged in Phase 22 as "first operational blocker."

## Schema reservation
- `schedule_commitments` not yet reserved in migrations. Slice 10 owes the reservation. Deferring would force a schema rewrite in later phases.

## SDK / API surface
- Using Supabase legacy `anon` / `service_role` keys; new `publishable` / `secret` keys exist in the dashboard but not confirmed compatible with installed SDK versions. Migration deferred; revisit when `@supabase/ssr` declares support.

## Cowork sandbox friction
- Sandbox mount can create / modify but not delete files. Git ops in the sandbox leave stale `.git/**.lock` files that block the next git op. Owner clears locks before each git command from their own terminal. Non-blocking, persistent friction.

## Design language
- Tailwind tokens from archived Vite shell not yet ported into new Next `tailwind.config.ts`. Shell placeholder pages use default Tailwind palette only. Port owed before real UI lands.
