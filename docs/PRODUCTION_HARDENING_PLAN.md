# Production Hardening Plan

Audit date: 2026-08-23. Source of truth: repository code, migrations, deployed migration history.

## Current architecture

- React 19, TypeScript, Vite, React Router, Zustand, Tailwind v4.
- Supabase Cloud project `gino2-production` in Tokyo: Auth, PostgreSQL/RLS/RPC, Edge Functions.
- GitHub Pages deploy under `/Gino2/`.
- Domain repositories call Supabase RPCs plus selected RLS-protected reads.
- Existing working tree contains unrelated admin/course/dashboard refactor WIP. It remains outside this plan's commits.

## Phase 0 baseline

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 0 vulnerabilities reported |
| `npm run test` | PASS; 5 legacy TS runner tests |
| `npm run lint` | PASS; currently only `tsc --noEmit` |
| `npm run build` | PASS; main JS 676 kB minified warning |
| local Supabase | BLOCKED; Docker daemon unavailable |
| production target | Verified `tdwjqgxbrdmxwlplopft` / `gino2-production` |

Largest confirmed files: `database.types.ts` 3088 lines, `index.css` 2442, `AdminProductionDashboard.tsx` 936, `scripts/seed-cloud-demo.ts` 663, `CourseVocabularyPanel.tsx` 671.

## Findings

### P0 fixed: Edge Function raw-error disclosure

`supabase/functions/_shared/http.ts` returned unknown `Error.message` with HTTP 400. Database/provider/internal detail could reach browsers. Phase 1 maps known business errors, sanitizes unknown errors to HTTP 500 `{ "error": "Không thể xử lý yêu cầu." }`, and logs only server-side.

### P0 fixed: Community direct-table mutation bypass

Community RLS policies allowed direct authenticated writes. This bypassed RPC rules for blocks, follows, messages, reports and group membership. `community_group_members` used `FOR ALL`, allowing a member to update its own role and a moderator to self-promote.

Phase 1 revokes direct `INSERT`, `UPDATE`, `DELETE` from `PUBLIC`, `anon`, and `authenticated` on all eight community tables. Existing client flows use RPC. The write RPCs are `SECURITY DEFINER`, with explicit `search_path = public`; they derive actor from `auth.uid()`.

### High: Auth role lookup resets valid learner session

`AuthProvider.applySession` clears session when admin role query fails/times out. Scope Phase 3. Separate session status from staff-role status; admin routes wait for authorization but learner routes retain valid session.

### High: Timezone correctness

Rewards/streak/community daily logic uses UTC date casts, ignoring `learner_settings.timezone`. Scope Phase 2. Add one shared SQL local-date helper; refactor all daily-sensitive RPCs and boundary tests.

### Medium: Legacy direct learning writes

Legacy correctness-boolean RPCs are revoked in `202608090010`. Current `submit_review_answer` and `submit_assessment` calculate correctness server-side. Retain database tests in Phase 5/6.

### Medium: Quality gates incomplete

`npm run lint` is typecheck, not ESLint. No Vitest/RTL/Playwright setup. Scope Phase 4/5.

### Medium: Bundle warning

Main bundle 676 kB minified. Measure before dashboard/image changes; scope Phase 11/12.

## SECURITY DEFINER audit

Phase 1 reviewed learner integrity RPCs: `submit_assessment`, `submit_review_answer`, `submit_vocabulary_rating`, `record_lesson_progress`, `claim_daily_reward`, game completion. They use `auth.uid()`, server-derived scoring/progress, explicit `search_path`, and revoked public execute. No Phase 1 integrity change required.

Community write RPCs were changed to definer because table mutation is RPC-only. All have fixed `search_path`; actor identity comes from `auth.uid()`. Follow/message functions enforce blocks. Group join sets DB default role `member`; leave excludes owner. Role management UI/RPC does not exist, so direct update is denied.

Remaining complete inventory/re-audit: admin, notification and AI `SECURITY DEFINER` functions in Phase 14/ongoing DB security suite.

## Migration impact and rollback

- `202608230001_harden_community_rpc_boundaries.sql`: switches listed community write RPCs to definer, fixed search path, denies table mutations.
- `202608230002_revoke_public_community_table_access.sql`: removes inherited `PUBLIC` table access; restores authenticated read grants.
- No data rewrite/deletion. Rollback only if a confirmed legacy direct write client exists: explicitly grant least required operation after fixing client to RPC. Do not restore broad policies.

Applied to production through Supabase Management API; migration history marked applied after query execution. Database backup was unavailable because CLI login does not expose DB password. Both migrations are reversible grant changes.

## Database security validation

Production catalog check confirmed RLS enabled for all community tables and `has_table_privilege(..., insert|update|delete)` is false for `anon` and `authenticated` on all eight tables. Full REST/JWT two-user attack tests remain Phase 6; run with temporary isolated test users after test environment exists.

## Execution order

1. Phase 1: complete source validation, commit scoped docs/functions/migrations/tests.
2. Phase 2: learner timezone helper and daily boundary tests.
3. Phase 3: auth session/role state separation.
4. Phase 4-6: eslint, Vitest/RTL/Playwright, local/test Supabase direct-access tests.
5. Phase 7 onward: admin loading/refactor, workspace, CSS, measured performance, PWA, AI, payment design, docs.

## Test strategy

- Deno unit: Edge error mapping/sanitization.
- Existing TS runner: preserve existing tests.
- Production catalog: migrations, RLS, effective privilege checks.
- Later test Supabase: user A/B REST direct insert/update/delete, blocked DM/follow, group role escalation, learner/admin mutation authorization.
- Every phase: `npm run test`, `npm run lint`, `npm run build`, `git diff --check`, scoped diff review.

## Files affected, Phase 1

- `supabase/functions/_shared/http.ts`
- `supabase/functions/_shared/http.test.ts`
- `supabase/migrations/202608230001_harden_community_rpc_boundaries.sql`
- `supabase/migrations/202608230002_revoke_public_community_table_access.sql`
- `docs/PRODUCTION_HARDENING_PLAN.md`
