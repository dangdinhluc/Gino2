# Gino2 Platform Upgrade Audit

## Audit status

- Date: 2026-08-23 (Asia/Tokyo)
- Repository: dangdinhluc/Gino2
- Branch: main
- HEAD at audit: 62e7535 (docs: clarify live timezone benchmark)
- Production project inspected read-only: gino2-production
- Applied migrations inspected: 43, through 20260823053932_optimize_remaining_learner_timezone_reads
- Local Docker/Supabase was not started.
- No production data, historical migration, RLS policy, grant, or application code was changed during this audit.
- Existing unrelated worktree changes were preserved: AGENTS.md, package.json, scripts/seed-gaishoku.ts, and src/data/courses/.

This document is the Phase 0 gate. It is an audit and migration-safe architecture map, not an implementation of Phases 1–14.

## Executive result

Platform readiness: PARTIAL. Gino2 already has a useful modular monolith, a working Supabase content model, server-side assessment submission, content revisions, roles, packages, enrollments, and a reusable course workspace. It is not yet a configurable multi-course platform.

The highest-risk gaps are:

1. Course configuration and learner capabilities are not modeled as data.
2. The course workspace still contains Tokutei-specific labels, vocabulary enrichment, and fixed tabs.
3. Assessments are percentage-based multiple-choice records without sections, weighted points, configurable timers, or a server-created timed attempt lifecycle.
4. There is no validated, draft-only course package import pipeline.
5. Admin has production CRUD, but not a course-centric builder with preview and a complete content publishing workflow.
6. The production Supabase advisor reports broad function execute grants and RLS policy/performance findings that require per-function review.

The existing ssw2-gaishoku data must not be treated as proof that the generic platform is complete. It is already a published legacy-shaped course and a useful migration test fixture, but it does not currently represent the requested 70-minute, 250-point, 163-pass, eight-section assessment model.

## Evidence and baseline

### Source and production evidence

The audit used:

- Current main source and migration files.
- CodeGraph symbol/call-path inspection for course, exam, admin, enrollment, and route code.
- Linked Supabase production metadata, table definitions, RLS policies, function definitions, grants, advisor output, and aggregate counts.
- Current GitHub Actions workflows and package scripts.
- A clean read-only production query set. One large exploratory join exceeded production temporary disk space (53100 No space left on device); it performed no write and was not repeated.

### Current application baseline

| Check | Result | Evidence |
|---|---:|---|
| npm run typecheck | PASS | tsc --noEmit, exit 0 |
| npm run lint | PASS with warnings | 0 errors, 52 warnings |
| npm run test | PASS | 6 files, 13 tests |
| npm run build | PASS with warning | Vite build succeeded; one chunk exceeds 500 kB |
| Playwright production smoke | NOT RUN | No dedicated test account/session was used in this read-only audit |
| Browser request trace | NOT RUN | Requires an authenticated test session and a production browser run |

### Current build and asset snapshot

The build produced the following uncompressed asset sizes:

| Asset | Size |
|---|---:|
| Initial JS chunk index-nlvHF2NI.js | 659.52 kB minified; 199.03 kB gzip |
| CSS chunk index-D0EejgiT.css | 236 kB |
| CourseLearningPage chunk | 128.84 kB minified |
| AdminDashboardPage chunk | 90.10 kB minified |
| GameScreen chunk | 38.85 kB minified |
| DashboardPage chunk | 32.12 kB minified |

Largest current public assets include:

| Asset | Size |
|---|---:|
| public/assets/shared/backgrounds/dashboard-library-background.png | 1,188 kB |
| public/assets/games/gift-box.png | 940 kB |
| public/assets/exams/tanuki.png | 932 kB |
| public/assets/games/game-tanuki.png | 872 kB |
| public/assets/games/thumbnails/sprint.png | 796 kB |
| public/assets/vocabulary/tanuki.png | 776 kB |
| public/assets/shared/mascots/meow-mascot.png | 728 kB |
| public/assets/shared/mascots/ai-tutor-tanuki.png | 600 kB |

This confirms that bundle and asset work remains relevant, but it is not a Phase 0 platform-model change and must not displace the generic course/assessment/security work.

## Production inventory

### Course and learning data

The production database currently contains:

| Table/domain | Rows |
|---|---:|
| courses | 5 |
| course_modules | 13 |
| lessons | 72 |
| vocabulary_items | 214 |
| lesson_vocabulary | 216 |
| documents | 73 |
| podcast_episodes | 13 |
| review_questions | 710 |
| review_options | 2,146 |
| assessments | 16 |
| assessment_questions | 326 |
| assessment_attempts | 9 |
| lesson_progress | user-scoped; no global catalog total used |
| vocabulary_progress | user-scoped; no global catalog total used |
| content_revisions | 326 |
| packages | 3 |
| package_courses | 5 |
| enrollments | 4 |

Published production courses are:

| ID | Slug | Title | Level | Order |
|---|---|---|---|---:|
| demo-course-a1 | demo-tokutei-a1-foundation | Demo Tokutei A1 Foundation | A1 | 1 |
| demo-course-workplace | demo-workplace-japanese | Demo Workplace Japanese | A2 | 2 |
| demo-course-interview | demo-tokutei-interview | Demo Tokutei Interview | N4 | 3 |
| demo-course-kaigo | demo-kaigo-workplace | Demo Kaigo Workplace | A2 | 4 |
| ssw2-gaishoku | tokutei-gino-2-gaishoku | 特定技能2号・外食業 | SSW2 | 20 |

The production courses table currently has no course_type, category, language, target_audience, subtitle, cover/thumbnail, theme configuration, feature configuration, or learning configuration fields.

### 外食業2号 current fixture

The current production course ssw2-gaishoku contains:

| Item | Count |
|---|---:|
| Modules | 5 |
| Lessons | 56 |
| Unique attached vocabulary | 166 |
| Documents | 57 |
| Podcasts | 5 |
| Assessments | 8 |
| Assessment questions | 278 |
| Content revisions | 326 total course-related revisions: 1 course, 5 modules, 56 lessons, 57 documents, 5 podcasts, 166 vocabulary, 8 assessments |

Four published mock assessments have 55 questions each. Their current records use passing_score = 65, have no duration, no sections, and no per-question or per-section points. The current production data therefore does not satisfy the requested 70-minute/250-point/163-pass configuration.

## Current architecture

### Frontend

- React 19, TypeScript, Vite, React Router, Zustand, Tailwind CSS v4, and Supabase JS.
- Feature folders are already used for courses, exams, admin, enrollments, dashboard, AI, community, and review.
- Main learner routes are React-lazy-loaded in src/app/router/app-routes.tsx.
- Repositories are the usual Supabase boundary; pages and hooks assemble view models.
- The course workspace is reused through CourseLearningPage, but its data contract and navigation registry are fixed rather than configuration-driven.

### Database

The current schema is a staged production schema, not a new design. Core learning tables are normalized around courses, modules, lessons, vocabulary, documents, assessments, attempts, progress, packages, and enrollments. Content revision history already exists.

The original course/assessment foundation migration still defines the important legacy constraints:

- courses: slug/title/level/status/description/theme/order.
- assessments: course/title/type/passing percentage/status/order.
- assessment_questions: prompt, correct_answer, JSON options, order, explanation.
- assessment_attempts: percentage score, boolean passed, submitted answers JSON.

Later migrations added content lifecycle controls and assessment prerequisite enforcement, but did not add generic assessment sections, weighted scoring, question types, timer configuration, or timed attempt lifecycle.

### Auth, RLS, and RPC

- Auth is Supabase Auth; server authorization is intended to derive from auth.uid().
- RLS is enabled on the relevant production tables. It is not disabled as a workaround.
- Published content and enrollment access are guarded by policies and helper functions such as can_read_course() and can_read_lesson().
- Sensitive assessment submission is performed through submit_assessment; the answer key is not selected by the frontend paper mapper.
- Admin roles already include owner, content_editor, instructor_support, and analyst.

### Admin

AdminProductionDashboard and the admin repositories provide real CRUD for courses, modules, lessons, vocabulary, documents, audio, lesson assets, exercises, assessments, questions, review questions, packages, enrollments, revisions, and staff data. This is valuable existing infrastructure.

The current shape is a broad section dashboard. It is not yet a course-centric builder that guides a non-technical author through course → modules → lessons → vocabulary → question bank → assessments → preview → review → publish. Lists are also inconsistently paginated; several content and question-bank reads are unbounded.

### Commerce and access

Packages, package-course relationships, and enrollments exist. Free enrollment is implemented through a guarded RPC. Paid checkout and verified payment webhooks do not exist.

The current UI formats non-zero package prices using price_cents / 100 for every currency. This is not safe for zero-decimal JPY/VND and must be corrected before payment is introduced. Browser course IDs are not an authorization source; server checks and RLS must remain authoritative.

### CI and deploy

- .github/workflows/deploy.yml runs on direct pushes to main and deploys GitHub Pages under /Gino2/ after lint, unit test, typecheck, and build.
- .github/workflows/playwright-smoke.yml is PR/workflow-dispatch capable but gated by vars.RUN_PLAYWRIGHT_SMOKE == 'true'; it is not currently an unconditional PR quality gate.
- The notification worker is scheduled separately and calls the Supabase Edge Function with a secret.
- Repository branch protection/required checks are not represented in this repository. They must be configured in GitHub settings or documented as an operational prerequisite.

## Current → target architecture map

| Area | Current state | Target state | Audit status |
|---|---|---|---|
| Course identity | Course slug/title/level/status plus theme color | Same stable identity plus config metadata and lifecycle | PARTIAL |
| Course type | No production field; UI assumes Tokutei in places | Metadata such as tokutei, jlpt, conversation, custom; no large code switch | MISSING |
| Capabilities | Fixed five workspace tabs and required data | feature_config drives visible tools and loading | MISSING |
| Course content | Reusable modules/lessons/vocabulary/docs | Reusable content with course-aware authoring and publish workflow | PARTIAL |
| Assessment | Percentage, JSON options, simple multiple-choice | Sections, points, scoring mode, question type, timer, attempts, result visibility | MISSING |
| Question security | Frontend paper omits answer key, but direct table SELECT privilege is absent | Safe paper RPC returns only learner-safe fields; server scores | PARTIAL / BLOCKER |
| Strategy | Explanation text exists in some questions | Optional generic strategy metadata revealed after submit | MISSING |
| Import | Direct seed script/content data; no package contract | Validate → preview → dry run → import draft → review → publish | MISSING |
| Admin | Broad production CRUD dashboard | Course-centric builder, question bank, exam builder, preview | PARTIAL |
| Learner workspace | Reusable page with fixed data contract | Capability-driven reusable course shell | PARTIAL |
| Package/enrollment | Free packages and enrollments | Explicit verified access, expiry/revocation/bundles where needed | PARTIAL |
| Payments | Design notes only; no provider integration | Provider-ready minor-unit money and verified events | PARTIAL |
| Content versioning | content_revisions and publish/rollback functions exist | Immutable learner-facing revisions and reproducible attempts | PARTIAL |
| Security grants | RLS and role guards exist; execute grants need classification | Per-function grants and fixed SECURITY DEFINER boundaries | BLOCKER |
| Scale | Some generic page helper; many unbounded lists | Paginated admin/question-bank/activity paths, measured indexes | PARTIAL |
| Release | Main push deploy; smoke optional | PR required checks and protected production branch | PARTIAL |

## Confirmed hardcoded course assumptions

These are verified current findings, not copied assumptions from the request:

1. src/features/courses/pages/CourseListPage.tsx displays "Khóa học Tokutei", "Tokutei Gino", and Tokutei-oriented copy. It also derives a Japanese icon/label from the level instead of course configuration.
2. src/features/courses/lib/courseWorkspaceNavigation.ts defines a fixed five-entry courseWorkspaceTabs registry: vocabulary, documents, practice, games, and exams. Labels and hints include Tokutei-specific wording.
3. src/features/courses/repositories/courseLearningRepository.ts imports TOKUTEI_VOCAB and enriches database vocabulary through a Tokutei romaji deck. This is course-specific logic inside a generic repository.
4. The same repository requires modules/lessons, documents, podcasts, assessments, and review/vocabulary content for every course load. A capability-disabled course cannot satisfy this contract.
5. CourseLearningWorkspaceData uses fixed arrays for vocabulary, review questions, documents, games, exams, and podcasts. It has no capability map or generic content block registry.
6. There is no GaishokuExamRunner, JLPTExamRunner, or equivalent per-course runner. This is ALREADY RESOLVED and should remain that way; the existing generic runner should be upgraded rather than duplicated.
7. The existing course-specific practice boundary is ALREADY RESOLVED: CoursePracticePanel serves course practice while /app/practice serves global review/SRS. Future capability work must preserve this distinction.

## Assessment engine audit

### Existing behavior

- assessments.passing_score is a percentage-style integer.
- assessment_questions has prompt, JSON options, a correct_answer, order, and explanation.
- submit_assessment calculates correct count and a percentage on the server and applies the existing prerequisite rule.
- assessment_attempts is created at submission; there is no server-created started_at/expires_at lifecycle.
- ExamRunnerPage stores answers in local React state, has no configured countdown, no unanswered warning, no flag-for-review state, no refresh recovery, and no auto-submit at zero.
- ExamResultPage displays score/pass and question details, but not generic section points, time used, or strategy blocks.
- Current learner paper selection does not request correct_answer, which is a useful security property to preserve.

### Production permission inconsistency

The live assessment_questions RLS policy allows authenticated reads under content/enrollment conditions, but has_table_privilege and information_schema.role_table_grants show that authenticated has no SELECT grant on assessment_questions (only DELETE/INSERT/UPDATE). The current direct frontend paper query therefore has an unsafe/incomplete contract: granting table SELECT would risk exposing correct_answer.

The safe migration path is a learner-safe paper RPC or a controlled view/RPC contract that omits answer keys, followed by removal of the direct table dependency. Do not repair this by broadly granting SELECT.

### Migration-safe assessment direction

Use a dual-read, staged model:

1. Keep current assessment and question columns for existing rows.
2. Add nullable assessment configuration: description, duration, scoring mode, total points, passing mode/value, max attempts, shuffle/result flags, and config JSON.
3. Add assessment_sections and nullable question section_id, question_type, points, and metadata.
4. Retain legacy JSON options/answer fields while old assessments remain active; normalize options only when the migration has a demonstrated need.
5. Add timed attempt lifecycle fields and server RPCs for start/submit; keep a compatibility wrapper for legacy submissions during rollout.
6. Make server scoring select behavior from assessment configuration, never from course slug or title.

## Strategy explanation audit

There is no generic persisted strategy object in the assessment question/result contract. Some prepared scripts/seed-gaishoku.ts content maps strategy material into plain explanation text and document metadata, but this is not a reusable validated question.metadata.strategy model and is currently untracked user work.

The target should use optional JSON metadata, for example metadata.strategy, with question-pattern, signal words, quick rule, elimination tips, traps, exam steps, and memory tip. Scoring must ignore it. The result API must only expose protected answer reasoning after submission and according to assessment visibility configuration.

## Course import audit

No generic course package format, parser, schema/reference validator, preview, dry run, or draft-only import workflow exists in the inspected production architecture.

The current untracked seed script is useful as a content source but is not the target pipeline: it writes directly to legacy tables, has no package-wide reference validation, does not model sections/points/duration, and cannot guarantee idempotency or a publish review gate.

The minimum safe import boundary is a namespaced JSON package with:

- schema validation;
- duplicate ID and foreign-key validation;
- question/option/scoring validation;
- preview and dry-run output;
- idempotent draft upsert where practical;
- no auto-publish;
- content revision records for later publish actions.

## Admin and learner workspace audit

### Admin

Existing CRUD/revision repositories should be reused. A safe first version of the builder should compose them into a course-scoped workspace rather than replace AdminProductionDashboard wholesale. The missing pieces are workflow and composition: course overview, content tree, question bank filters/pagination, assessment builder, preview, and status transitions.

The existing role union is a good starting point. Content editors must not inherit owner operations; this needs to be verified function-by-function in Phase 10.

### Learner

The reusable course page is a good base, but it currently assumes all content types exist. The next contract should load a normalized course descriptor with capability flags and optional content sections. A disabled capability should skip its query and renderer, not return an error because another fixed panel is empty.

The course workspace must remain a single reusable shell. Adding a course must not add a new route or a per-course component.

## Enrollment, entitlement, and payment audit

Current packages and enrollments are enough to stage course access safely, but the following are not yet complete:

- explicit entitlement semantics for bundles, expiry, manual grants, and revocation;
- a verified payment state machine;
- provider webhook/idempotency handling;
- currency-safe amount representation and formatting.

Do not introduce a separate entitlement table until a concrete access case cannot be represented by package/enrollment. First preserve server-side enrollment/RLS checks, then add only the missing state. Any money migration must introduce a correct minor-unit policy rather than globally assuming two decimals.

## Production security audit

### RLS snapshot

RLS is enabled on the relevant public tables. Policies generally require authenticated users, published status, enrollment, or staff permissions. The existing can_read_course() function requires a published course and an active/completed enrollment for learner content; can_read_lesson() builds on it.

This is ALREADY RESOLVED at the architectural level: access is not intended to be granted by a browser-supplied course ID and RLS is not disabled. It still needs a complete grant/function audit before new content mutations are added.

### Supabase advisor snapshot

Read-only linked advisor output reported 226 warnings:

| Finding category | Count |
|---|---:|
| SECURITY DEFINER function executable by anon | 78 |
| SECURITY DEFINER function executable by authenticated | 77 |
| RLS auth initplan | 53 |
| Multiple permissive policies | 16 |
| Mutable function search path | 1 |
| Leaked-password protection | 1 |

Examples include admin mutation functions, content revision functions, assessment functions, and course read helpers. Function bodies often contain role guards, so the count is not itself proof of exploitability. It is, however, a confirmed P0 audit backlog. Phase 10 must classify each function as public, authenticated, staff, owner, service-only, or trigger-only and then create a narrow forward migration. A blanket REVOKE ALL is unsafe and is not authorized by this audit.

public.set_updated_at is the mutable-search-path finding and should receive an explicit search_path in a forward migration after its trigger usage is verified.

The linked db lint retry could not authenticate with the available database credentials; it is recorded as NOT RUN for this audit. No password or secret was stored.

## Current versus target data model

### Course

Keep current courses.id, slug, title, level, status, description, theme_color, and ordering behavior. Add nullable/config fields in a new migration only after checking every current writer and reader. The first useful additions are course type/category/language/audience metadata plus feature_config, theme_config, learning_config, and asset URLs. JSONB should hold evolving configuration; do not add one column per future feature.

### Assessment

Keep legacy fields during transition. Add normalized sections and typed question configuration without making the core engine depend on Japanese labels. Store strategy as optional JSON metadata. Do not encode the eight 外食業 sections or their points in React, SQL function names, or route names.

### Attempts

For timed/high-value assessments, prefer server-derived start and expiry timestamps. Existing historical attempts must remain readable and reproducible. New scoring should write a structured result snapshot so later content edits cannot change an old result.

## Proposed phase gates

This is the minimum sequence that respects existing production data:

1. Phase 0 — this document: accept the current/target map and security/data blockers.
2. Phase 1: add nullable generic course configuration and compatibility defaults; no learner behavior change until readers are dual-read.
3. Phase 2: add capability normalization and a course descriptor; keep current tabs as the default for legacy courses.
4. Phase 3: add assessment sections/config/typed metadata, safe paper RPC, and configuration-driven server scoring; preserve legacy assessment compatibility.
5. Phase 4: add strategy metadata/result rendering behind result visibility.
6. Phase 5: add pure validation plus draft-only import and tests before any production course import.
7. Phases 6–9: compose the admin builder, capability-driven learner shell, access semantics, and money model.
8. Phases 10–12: complete per-function security review, measured indexes/pagination, tests, and release gates.
9. Phase 13: migrate ssw2-gaishoku as a generic test case only after the engine passes the requested section/score/timer tests.
10. Phase 14: production browser smoke, authorized/denied security flows, migration verification, and final report.

Each schema change must be a new forward-only migration. Applied migrations must not be edited, and no fake content or scale-test rows should be written to production.

## Architecture decisions for implementation

1. Keep the modular monolith. React feature boundaries plus Supabase RPC/RLS are sufficient; no Next.js, monorepo, microservices, Redis, or search platform is justified by this audit.
2. Configuration is data. Course type is metadata; capability flags select renderers and queries. Avoid course slug switches.
3. Use staged normalization. Do not break legacy rows to achieve a clean theoretical schema. Dual-read and migrate content in controlled steps.
4. Keep server authority. RLS, auth.uid(), server scoring, enrollment checks, and verified payment events remain authoritative.
5. Prefer normalized assessment core plus bounded JSON metadata. Sections, points, and lifecycle belong in columns/tables; strategy and future optional configuration belong in validated JSON.
6. Import is draft-only. A valid package can be imported, but publishing remains an explicit editorial action.
7. Reuse current course practice/SRS boundary and revision system. Do not recreate already-working infrastructure.

## Phase 0 acceptance

- [x] Current main inspected.
- [x] Production schema and data inspected read-only.
- [x] Migration history inspected.
- [x] Current course, exam, admin, enrollment, RLS/RPC, and CI architecture inspected.
- [x] Known course/exam assumptions verified against source.
- [x] Existing working abstractions marked for reuse.
- [x] Migration-safe target map documented.
- [x] Baseline typecheck/lint/unit/build recorded.
- [x] No production data or applied migration changed.

## Next gate

Phase 1 may start with a small forward-only course configuration migration and compatibility reader. It must not start by importing 外食業 content, redesigning the UI, adding payment, or replacing the current assessment runner wholesale.

The current ssw2-gaishoku production content remains a legacy compatibility fixture until the generic assessment/configuration tests prove that it can be represented without course-specific code.
