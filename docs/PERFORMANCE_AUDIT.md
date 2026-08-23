# Performance Audit

## Environment

- Date: 2026-08-23 JST
- Branch: `main`
- Node: `v25.9.0`
- npm: `11.12.1`
- Supabase CLI: `2.98.1`
- Browser measurement: Playwright Chromium headless shell, fresh context per route, 390x844 viewport
- Database measurement: linked Supabase production database, read-only queries only
- Local Docker/Supabase: not started, per request
- Production migration deployment: completed after validation; both performance migrations are applied

## Before

### Dashboard

- Initial requests: 11 for an unauthenticated `/app/dashboard` navigation, ending at `/login`; 0 Supabase requests.
- Authenticated Dashboard request count: not measured because no test learner credentials were available.
- Source audit confirmed `fetchLearnerProfile()` nested `fetchLearnerDashboard()` and `fetchLearnerStats()`, producing 2 logical dashboard/stats calls.
- Time to useful UI: authenticated Dashboard not measured. The unauthenticated baseline boundary measured approximately 268.4 ms DOMContentLoaded and 271 ms load in the initial production-preview run.
- Slowest authenticated API request: not measured.

### Database

- Production dataset: 100 `learning_activity_events`, 2 learners with events, maximum 83 events per learner.
- Current production `get_learner_stats()` EXPLAIN: 4,951.729 ms execution, 1,471 shared buffers, with the current function definition still pending the new migration.
- Historical `pg_stat_statements` for the current function wrapper: 705 calls, 144.12 ms mean, 6,229.82 ms maximum.
- The old helper path evaluated `learner_local_date()` per event; `learner_timezone()` validated against `pg_timezone_names` inside that path.
- `get_daily_learning_plan()` timing: not measured independently.
- Existing event index: `(user_id)`; no composite index was added without plan evidence.

### Bundle

- Initial JS: 677.02 kB minified, 203.73 kB gzip.
- CSS: 237.70 kB, 36.51 kB gzip.
- Largest lazy chunk: `CourseLearningPage`, 128.67 kB, 32.20 kB gzip.
- Vite emitted the existing warning for an initial JS chunk larger than 500 kB.
- AI chat and global search implementation were still part of the shell dependency graph.

### Assets

- Dashboard background: 1,215,327 bytes, 1024x1024 PNG.
- Meow mascot: 744,310 bytes, 1024x1024 PNG.
- AI tutor mascot: 612,739 bytes, 920x1024 PNG.
- Sleeping mascot: 440,091 bytes, 970x743 PNG.
- Navigation PNG total: 917,680 bytes; individual files were 138,847–213,131 bytes while rendered around 20 px.
- Other large feature assets included game gift box 960,532 bytes, exam mascot 951,015 bytes, and game thumbnails up to 811,375 bytes.

## Changes

- Added forward-only timezone validation and one-time context resolution for `get_learner_stats()` in `20260823051556_optimize_learner_stats_timezone.sql`.
- Added forward-only one-time timezone resolution for `get_learner_dashboard()`, `record_game_completion()`, `create_progress_post()`, `claim_daily_reward()`, and `queue_due_reminders()` in `20260823053932_optimize_remaining_learner_timezone_reads.sql`.
- Removed profile repository composition of dashboard/stats and passed the authenticated user ID from `AuthProvider` where the browser only needs an RLS-filtered key.
- Removed redundant browser `getUser()` preflights before RPCs that already enforce `auth.uid()` server-side.
- Split Dashboard critical, secondary, and optional loading states; optional notifications and hero data no longer hold the Dashboard shell.
- Made AI history conditional on `enabled` and lazy-loaded the chat panel. Reopen keeps the in-session history.
- Lazy-loaded the global learning search popover until the first open.
- Converted selected shared, game, exam, document, vocabulary, and navigation assets to resized WebP while preserving PNG sources.
- Reduced AnimeBackdrop mobile blur and rendered motes to eight on screens up to 640 px; existing reduced-motion rules remain active.
- Kept service-worker and manifest notification/app icons on the optimized WebP asset. The service worker remains push-only and does not cache authenticated API responses.
- Added regression tests for dashboard request ownership, progressive loading, AI history loading, profile repository independence, and timezone migration structure.

## After

These are code/build results after the changes. The authenticated production Dashboard browser flow was not measured because no test learner credentials were available; the database functions were measured live after migration deployment.

### Dashboard

- Fresh production-preview `/app/dashboard` navigation: 11 requests, 0 Supabase requests, final URL `/login`, 215.7 ms DOMContentLoaded, 218.1 ms load, 0 page errors.
- Fresh production-preview landing page: 17 requests, 260.8 ms DOMContentLoaded, 263.3 ms load, 0 page errors.
- Largest fresh landing resource: initial JS transfer 199,332 bytes; encoded body 199,032 bytes.
- Authenticated Dashboard request count: not measured.
- Progressive-loading unit test: critical Dashboard content rendered while profile, plan, stats, notifications, and hero promises remained pending.

### Database

- New migration dry-run and apply: passed; `20260823051556` and `20260823053932` are present in `supabase_migrations.schema_migrations`.
- Live production `get_learner_stats()` EXPLAIN after deployment: 7.348 ms on the first measured run and 3.528 ms on a warm run.
- Live production `get_learner_dashboard()` EXPLAIN after deployment: 8.013 ms.
- Live production `get_daily_learning_plan()` EXPLAIN after deployment: 16.822 ms.
- Structural regression test confirms timezone context is materialized once and event dates use direct `AT TIME ZONE` conversion.
- Remaining timezone-sensitive RPCs now use the stored validated timezone directly rather than calling the row-wise helper.

### Bundle

- Initial JS: 659.55 kB minified, 199.05 kB gzip.
- CSS: 237.80 kB, 36.54 kB gzip.
- Largest lazy chunk: `CourseLearningPage`, 128.84 kB, 32.28 kB gzip.
- Lazy AI chat chunk: 5.62 kB, 2.50 kB gzip.
- Lazy search popover chunk: 9.08 kB, 3.37 kB gzip.
- The initial JS remains above the aspirational 500 kB target; no broad manual chunking was added without a measured feature boundary.

### Assets

- Dashboard background: 1,215,327 → 298,600 bytes, 1024x1024 WebP.
- Meow mascot: 744,310 → 21,628 bytes, 512x512 WebP.
- AI tutor mascot: 612,739 → 52,030 bytes, 512x570 WebP.
- Sleeping mascot: 440,091 → 24,842 bytes, 512x393 WebP.
- Brand mascot: 240,447 → 36,134 bytes, 512x512 WebP.
- Navigation total: 917,680 → 20,550 bytes; optimized files are 96 px wide and 2,954–5,200 bytes each.
- The largest optimized feature mascot is 65,338 bytes; all converted feature assets are below 70 kB.

## Request count comparison

Authenticated rows below are source/unit instrumentation, not live browser counts.

| Request | Before | After |
|---|---:|---:|
| `get_learner_stats` | 2 logical calls from Dashboard + nested profile source | 1 logical call; regression test passes |
| `get_learner_dashboard` | 2 logical calls from Dashboard + nested profile source | 1 logical call; regression test passes |
| profile data | 1 profile call plus nested dashboard/stats work | 1 profile call using known AuthProvider user ID |
| `get_daily_learning_plan` | 1 | 1 |
| notifications | 1, global loading barrier | 1, non-blocking section |
| hero slots | 1, global loading barrier | 1, non-blocking section |
| `ai_messages` | 1 eager history request on shell mount | 0 until chat opens; 1 on first open; no reopen refetch |

## DB benchmark comparison

| Measurement | Before | After |
|---|---:|---:|
| Current production `get_learner_stats()` EXPLAIN | 4,951.729 ms | 7.348 ms first run; 3.528 ms warm run |
| Current production `get_learner_dashboard()` EXPLAIN | Not measured separately | 8.013 ms |
| Current production `get_daily_learning_plan()` EXPLAIN | Not measured separately | 16.822 ms |
| `pg_timezone_names` access | In the read helper path | Write-boundary validation in pending migration |

## Bundle comparison

| Artifact | Before | After |
|---|---:|---:|
| Initial JS minified | 677.02 kB | 659.55 kB |
| Initial JS gzip | 203.73 kB | 199.05 kB |
| CSS | 237.70 kB | 237.80 kB |
| CSS gzip | 36.51 kB | 36.54 kB |

## Asset comparison

The original PNGs remain in the repository as source/fallback material. Runtime asset references now use the optimized WebP variants.

## Mobile rendering notes

- `prefers-reduced-motion` was verified in the existing CSS for AnimeBackdrop and dashboard decorative animation.
- Small screens now render eight backdrop motes instead of sixteen and reduce blob blur from 70 px to 48 px.
- No real-device FPS, long-task, or compositor trace was available in this run; those claims remain unverified.

## Remaining bottlenecks

- Initial JS is 659.55 kB minified and still above the aspirational 500 kB budget. Motion and shared shell dependencies remain candidates for a later measured split.
- Authenticated Dashboard network timings still require a valid test learner session.
- Production schema lint still reports two pre-existing ambiguity errors in `public.report_community_content` and `public.upsert_community_profile`; they were outside this performance scope and were not changed.
- A later linked-schema-lint retry was blocked by Supabase CLI login-role password authentication; the earlier successful lint run produced the two errors above.
- No TTL cache was added. Dashboard stats/rewards are freshness-sensitive, and no authenticated revisit measurement justified introducing cache invalidation complexity yet.
- GitHub Pages deployment completed successfully from `main`; the live root `https://dangdinhluc.github.io/Gino2/` returns HTTP 200 and serves the `/Gino2/assets/...` build.
