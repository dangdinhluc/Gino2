# CLAUDE.md

Guidance for AI assistants working in this repository.

## 1. What this project is

**TOKUTEI GINO** (`tokutei-gino`) is a mobile-first web app that helps **Vietnamese
learners prepare for the Japanese Tokutei Ginou (特定技能 / specified-skilled-worker)
exam**. Learners buy a package → unlock courses → study vocabulary, drill exam
questions, read documents, and play review games. Admins manage all content
through a separate dashboard.

Deployed as a static SPA to GitHub Pages under `/Gino2/`.

### ⚠️ Domain rule: this app is about Japanese, never German

An earlier agent mistakenly migrated large parts of the codebase (games, admin
mock data, Supabase seed, docs) to **German** content. That was reverted by
`plans/2026-07-11-tokutei-full-migration/awf-plan.md`. **Do not reintroduce it.**

- All learning content is Japanese for Vietnamese workers: workplace greetings,
  reporting (報告), safety, interviews, paperwork.
- Never add `der/die/das`, Umlauts, `Deutsch`, `Prüfung`, `Goethe`, German names
  (`Anna Müller`), or "German learners" phrasing to code, mock data, seed SQL, or docs.
- `plans/2026-05-16-game-zone/` and `plans/2026-05-17-new-games-engagement/` are the
  historical source of that error. Treat them as **superseded**; do not follow their
  content decisions.

### Language convention

| Where | Language |
|---|---|
| Identifiers, types, file names, commit messages | English |
| Code comments | Vietnamese (dominant in this codebase) |
| User-facing strings, error messages, docs, plans | Vietnamese |

Match the surrounding file. Do not translate existing Vietnamese UI copy to English.

## 2. Commands

```bash
npm install            # or npm ci
npm run dev            # Vite dev server, port 3000, host 0.0.0.0
npm run test           # tsx src/test/run-tests.ts  — plain node:assert, no framework
npm run lint           # tsc --noEmit  — this is the ONLY linter; no ESLint config exists
npm run build          # vite build
npm run preview
npm run clean          # rm -rf dist
```

**Before finishing any code change, run `npm run test` and `npm run lint`.** CI runs
both and blocks deploy on failure. Both currently pass clean; keep them that way.

`eslint-disable` comments appear in a few files (e.g. `useSupabaseQuery.ts`,
`srs.test.ts`) but no ESLint is installed — they are inert leftovers, not a signal
that linting exists.

### Local Supabase

```bash
supabase start   # then copy the anon key into .env
```

Custom ports (see `supabase/config.toml`): API `54331`, DB `54332`, Studio `54333`,
Inbucket `54334`. Realtime, storage and analytics are **disabled**.

Seeded local accounts (`supabase/seed.sql`, local-only):

- `admin@example.test` / `LocalAdmin123!`
- `learner@example.test` / `LocalLearner123!`

Copy `.env.example` → `.env`. `.env*` is gitignored except the example.

## 3. Stack

React 19 · TypeScript 5.8 (`noEmit`, bundler resolution) · Vite 6 · Tailwind CSS v4
· React Router v7 · Zustand 5 · `@supabase/supabase-js` · `motion` · `lucide-react`
· `tsx` (test runner).

- **Tailwind v4 has no config file.** It is wired through the `@tailwindcss/vite`
  plugin, and the theme lives in `@theme { ... }` inside `src/index.css`. Add design
  tokens there, not in a `tailwind.config.js`.
- `@google/genai` and `express` are in `dependencies` but **currently unused** — the
  AI tutor is entirely mocked. Do not assume a Gemini integration exists.

## 4. Path alias — always `@/src/...`

`@` maps to the **repository root**, not to `src` (`vite.config.ts` alias +
`tsconfig.json` paths `"@/*": ["./*"]`). So the import is:

```ts
import { cn } from '@/src/lib/utils';                       // ✅
import { useAuth } from '@/src/features/auth/lib/AuthProvider';  // ✅
import { cn } from '@/lib/utils';                           // ❌ wrong — missing src
```

Convention in practice (271 alias imports vs 29 relative): **use `@/src/...` for
anything crossing a folder boundary**; relative imports only for immediate siblings
(co-located tests importing their subject, `./types`, layout siblings).

## 5. Architecture

Feature-sliced. Nothing lives at the top of `src/` except entry points and thin
re-export shims.

```
src/
  main.tsx, App.tsx          entry → <AppRouter />
  index.css                  Tailwind v4 @theme tokens + base/component layers
  app/
    router/                  index.tsx + public-routes / app-routes / game-routes
    layouts/                 MainLayout, Sidebar, BottomNav, RightSidebar, MobileAITutorPopover
  features/<feature>/        the real code — see slice layout below
  shared/                    lib/utils.ts (cn), lib/tts.ts, types/  (ui/ + hooks/ are empty stubs)
  data/                      cross-feature mock data (admin/, tokutei/, phaseOneMock, phaseTwoMock)
  lib/utils.ts, types.ts, constants.ts   re-export shims for legacy import paths
  test/                      run-tests.ts registry + games/ review/ social/ tests
```

### Feature slice layout

`src/features/<feature>/` uses a consistent subset of:

| Folder | Role |
|---|---|
| `pages/` | Route-level components (default export) |
| `components/` | Feature-local components |
| `hooks/` | Data-orchestration hooks (`useCourseList`, `useCourseLearningWorkspace`) |
| `lib/` | **Pure logic — this is where testable code belongs** (`srs.ts`, `authRouteDecisions.ts`, `adminDashboardModel.ts`) |
| `repositories/` | All Supabase reads/writes for the feature |
| `store/` | Zustand stores |
| `mock/` | Fallback/demo data |
| `types.ts` | Feature types |

Features: `admin`, `ai`, `auth`, `courses`, `dashboard`, `exams`, `games`, `grammar`,
`hub`, `legacy`, `profile`, `public`, `review`, `social`, `supabase`.

`services/`, `shared/ui/`, `shared/hooks/` and several `index.ts` barrels are
**empty `export {}` placeholders**. Don't assume they contain anything.

## 6. Routing & auth

`AppRouter` (`src/app/router/index.tsx`) mounts `<AuthProvider>` **outside**
`<Router>`, then three route groups in order: `PublicRoutes()`, `GameRoutes()`,
`AppRoutes()`.

| Group | Paths | Shell |
|---|---|---|
| `public-routes.tsx` | `/`, `/login*`, `/quick-login`, `/onboarding`, `/terms`, `/privacy`, `/admin`, `/admin/login` | none; `/admin` wrapped in `ProtectedRoute area="admin"` |
| `game-routes.tsx` | `/app/game/:gameId` | **no** `MainLayout` — fullscreen, no nav |
| `app-routes.tsx` | `/app/*` (26 child routes + an index redirect to `/app/dashboard`) | `ProtectedRoute area="learner"` → `MainLayout` |

`basename` is derived from `import.meta.env.BASE_URL` so routing works both at `/`
(dev) and `/Gino2/` (GitHub Pages). Never hardcode a leading `/Gino2` in links.

All 26 page components are **statically imported** at the top of `app-routes.tsx`
(no lazy loading — a known tech-debt item in the roadmap).

### Access rules — `decideAuthRouteAccess`

Auth decisions live in the **pure, fully tested** function
`src/features/auth/lib/authRouteDecisions.ts`. `ProtectedRoute` only renders its
verdict. Put new access logic there so it stays testable.

The key rule — **demo mode**: when Supabase is *not* configured, the learner area is
**open** (data is local-first, in localStorage) while the admin area returns
`setup-required`. Configured Supabase → unauthenticated users redirect to
`/login` or `/admin/login`; admin also requires a row in `admin_roles`.

`AuthProvider` wraps every Supabase auth call in a 3.5s timeout, guards against
stale responses via `sessionRequestIdRef`, and only surfaces raw error detail when
`import.meta.env.DEV`. Preserve those guards when editing it.

## 7. Data layer — Supabase with mock fallback

This is the single most important pattern in the codebase.

```
Supabase table → repositories/*.ts → hooks/use*.ts → page component
                                   ↘ falls back to mock/ when unconfigured or empty
```

1. **`supabase` can be `null`.** `src/features/supabase/lib/supabaseClient.ts` exports
   `supabase: SupabaseClient | null` plus `supabaseConfig`. Every consumer must
   null-check. A missing/placeholder anon key counts as unconfigured.
2. **Repositories return `null`, they don't throw, when unconfigured.**
   `if (!supabase) return null;` — real query errors *do* throw
   `new Error(error.message)`.
3. **Hooks decide the fallback.** See `useCourseList`: Supabase off → mock; Supabase
   on but empty → mock with `isFallback: true`; error → mock + error message. Pages
   therefore always render.
4. **`useSupabaseQuery`** is the generic read hook (`idle | loading | ready | error`),
   with mount + request-id guards against stale responses.
5. `rebaseSupabaseUrlForBrowser` rewrites a `127.0.0.1` Supabase URL to whatever
   hostname the browser used, so one `.env` works for localhost, LAN, and Tailscale.
   Cloud `*.supabase.co` URLs are never rewritten.
6. Writes go through `repositories/learningProgressRepository.ts`
   (`vocabulary_progress` upsert, `review_attempts` insert) and silently no-op when
   there is no session.

### Schema

28 tables in `supabase/migrations/202605140001_supabase_real_data_foundation.sql`
(profiles, admin_roles, courses, course_modules, lessons, lesson_assets,
lesson_exercises, vocabulary_items, lesson_vocabulary, review_questions,
review_options, assessments, assessment_questions, documents, podcast_episodes,
learner_profiles, enrollments, lesson_progress, vocabulary_progress, review_attempts,
assessment_attempts, learning_activity_events, packages, package_courses,
admin_alerts, admin_activity_logs, ai_prompts, api_key_metadata) with RLS policies.

Two follow-ups: `202607120001_learner_progress_writes.sql`,
`202607120002_course_review_rpc.sql`.

**Add new migrations as new timestamped files** (`YYYYMMDDNNNN_name.sql`); never edit
an applied migration.

## 8. State — Zustand

| Store | Persisted? | Purpose |
|---|---|---|
| `features/games/gameStore.ts` | no | Live session: score, combo, feedback, wrong-answer SRS queue |
| `features/games/courseGameStore.ts` | no | Course context handed to a game (vocab + review questions + return path) |
| `features/courses/store/progressStore.ts` | localStorage | Lesson completion, SRS queue, streak, weekly XP |
| `features/review/store/reviewStore.ts` | localStorage (`createJSONStorage`, node-safe) | SRS card states, review log (capped 4000), daily new-card limit, XP |
| `features/social/store/communityStore.ts` | localStorage | Community/mock social state |

Persisted stores must keep their **node-safe storage shim** — in-memory when
`localStorage` is absent — otherwise `npm run test` breaks.

## 9. Games

Five implemented games under `src/features/games/`: `FlappyVocab` (canvas + physics),
`MemoryMatch`, `WordBuilder`, `VocabSprint`, `SituationGame`. Shared pieces:
`GameShell`, `GameResult`, `useGameSession`, `gameStore`, `types.ts`.

`GameScreen.tsx` resolves `/app/game/:gameId`, normalizes legacy aliases
(`word-sprint` → `vocab-sprint`, `fill-blank` → `situation-game`, …), builds a
`CourseGameContext`, and calls the matching **generator** in `generators/` to turn
real course vocabulary into rounds. When adding a game: extend `CourseGameType`, add
a generator, register it in `normalizeGameType` + the render switch.

## 10. Testing

No Vitest/Jest. `npm run test` is `tsx src/test/run-tests.ts`, which **imports every
test file for its side effects**. Tests are top-level `node:assert` statements that
throw on failure.

**A new test file does nothing until you register it in
`src/test/run-tests.ts`.** This is the most common way tests get silently skipped.

Two locations, two styles — follow whichever you are next to:

- **Co-located** `src/features/**/*.test.ts` — relative import of the subject, bare
  asserts with descriptive third-argument messages, no console output.
- **Central** `src/test/{games,review,social}/*.test.ts` — `@/src/...` imports,
  numbered `// TC-XXX-NN:` comments tied to the spec docs, blocks in `{ }` scopes,
  ends with `console.log('✓ name.test passed')`.

Because assertions are top-level, tests must be deterministic and free of DOM/network
access. That is why pure logic belongs in `lib/` — `srs.ts`, `authRouteDecisions.ts`,
`adminDashboardModel.ts`, `seedValidation.ts`, and the repository mappers are all
tested this way. Repository tests exercise the **pure mapper functions**
(`mapCourseRowToEntry`), not live Supabase.

## 11. Design system

`design-system/MASTER.md` is authoritative and code must use its tokens first.
A file in `design-system/pages/` **overrides MASTER for that page only**
(currently `admin-dashboard.md`, `course-learning-workspace.md`).

Identity: warm cream "trust-first premium education". Primary `#C96A1B`, secondary
`#6F4AA8`, background `#F7F1E8`, surface `#FFF9F2`, text `#172033`. Radii 18/24/30/36.
Motion 160ms micro / 220ms panel / 300ms modal max. Light theme only.

Hard requirements: WCAG AA contrast, 44×44px minimum touch targets, always-visible
focus rings, honor `prefers-reduced-motion`. Avoid childish illustrations, many accent
colors in one panel, and glassmorphism on content-heavy pages.

Admin (`/admin`) gets a denser operational extension: background `#F5EFE6`, surface
`#FFFCF7`, table header `#F0E8DC`, neutral accent `#315C73`; charts should use bars,
capsules and sparklines rather than a new chart dependency.

Runtime tokens live in the `@theme` block of `src/index.css`, and `.app-route-shell`
there normalizes typography for all `/app` routes.

Use `cn()` from `@/src/lib/utils` (clsx + tailwind-merge) for conditional classes.

## 12. Documentation map

| Path | What it is |
|---|---|
| `docs/APP_BLUEPRINT.md` | **Read this first** — full feature inventory with ✅/⚠️/❌ status per screen |
| `docs/ROADMAP.md` | Gap analysis and P0/P1/P2 priorities |
| `docs/specs/*.md` | Feature specs (admin dashboard, supabase real data, new games) |
| `docs/design/*.md`, `docs/design-specs.md`, `docs/DESIGN.md` | Screen-level design + pre-written TC-XX test cases |
| `plans/<YYYY-MM-DD>-<feature>/awf-plan.md` | AWF workflow plans: Goal → Scope In/Out → Assumptions → Phase Breakdown → Dependencies → Risks → Tech Decisions → Open Questions → Handoff |
| `design-system/` | See §11 |
| `AGENTS.md` | Auto-generated `claude-mem` context stub — no conventions, safe to ignore |
| `README.md` | Empty (writing it is a roadmap item) |

When starting non-trivial work, check `docs/APP_BLUEPRINT.md` for whether a screen is
real or a mock shell, and grep `plans/` for prior decisions on the same area.

## 13. Current state — what is real vs. mocked

Do not assume a feature is wired to a backend. As of the latest blueprint:

- **Real:** auth + RBAC, course list/detail, Course Learning Workspace (vocab, review,
  games, exam tabs), all 5 games, SRS, exam flow, admin dashboard, Supabase progress
  writes.
- **Local-only (implemented, but localStorage — no Supabase):** Friends, Messages,
  Journal. These are genuine implementations under `src/features/social/`
  (`communityStore`, `autoReply`, `leaderboard`) reading real progress/review state —
  *not* shells, despite what `docs/APP_BLUEPRINT.md` still says.
- **Mock only:** the entire AI tutor (`useMockTutorChat` is Vietnamese keyword
  matching — no Gemini call), writing/speaking labs, learner dashboard stats,
  Stats & Achievements.
- **Legacy shells:** `src/features/legacy/pages/PhaseTwoPages.tsx` holds static
  Phase-2 screens. Seven route files are one-line re-export shims onto it —
  onboarding, terms, privacy, settings, grammar topic detail, writing history,
  speaking history:
  `export { SettingsShell as default } from '@/src/features/legacy/pages/PhaseTwoPages';`
  It also still exports dead `FriendsPage`/`MessagesPage`/`Journal` functions that
  nothing imports. Replacing a shell means writing a real page in the feature slice
  and deleting the shim, not editing `PhaseTwoPages.tsx`.
- **Missing entirely:** enrollment/package purchase UI (the `enrollments` table
  exists), document viewer, personal notes/highlights, notifications, error boundary,
  lazy routes.

`docs/APP_BLUEPRINT.md` is a snapshot and drifts — verify against the code before
trusting a ✅/❌ in it.

If you wire up Gemini, keep `GEMINI_API_KEY` off the client — a Vite-exposed key is
called out as a security gap in the roadmap.

## 14. CI/CD

`.github/workflows/deploy.yml` — on push to `main` or manual dispatch:
`npm ci` → `npm run test` → `npm run lint` → `npm run build` with
`GITHUB_PAGES=true` (sets Vite `base` to `/Gino2/`) → `cp dist/index.html
dist/404.html` for SPA fallback → deploy to GitHub Pages. Node 22.

There is no CI for pull requests — only `main`.

## 15. Working conventions

- Run `npm run test && npm run lint` before declaring work done.
- Keep pure logic in `lib/`, Supabase access in `repositories/`, orchestration in
  `hooks/`, rendering in `pages/`+`components/`. Don't call `supabase` from a page.
- Preserve the mock-fallback path when touching data code — the app must render with
  no Supabase configured.
- Register every new test in `src/test/run-tests.ts`.
- New migrations are new files; seed data must be Japanese Tokutei content.
- Several page files are 500–900 lines (`CourseLearningPage.tsx` 879,
  `AdminDashboardPage.tsx` 714). Extract into `components/` rather than growing them.
- Commit style is short imperative subjects (`chore: ignore local supabase state`).
