# SECURITY DEFINER inventory

Date: 2026-08-24. Source: repository migrations on `main` plus the forward-only anon revoke in `20260824090000_revoke_anon_security_definer_execute.sql`.

## Rule

- Browser is untrusted.
- `anon` must not execute learner, staff, scoring, reward, community-write, or admin RPCs.
- Do **not** `REVOKE ALL` from `authenticated` in bulk.
- Staff-only tightening is a later per-function pass after each body is classified.

## Classification

| Function | Intended grantee | Why |
|---|---|---|
| `get_assessment_paper_v2` | authenticated | Learner paper; already revoked from anon |
| `submit_assessment_v2` | authenticated | Server scoring |
| `get_latest_assessment_result_v2` | authenticated | Own attempt only |
| `get_assessment_result_detail_v2` | authenticated | Reveals answers after submit |
| `submit_assessment` | authenticated | Legacy scoring wrapper |
| `get_course_review_questions` | authenticated | Enrolled course practice |
| `get_learner_stats` | authenticated | Own stats |
| `get_learner_dashboard` | authenticated | Own dashboard |
| `get_daily_learning_plan` | authenticated | Own plan |
| `claim_daily_reward` | authenticated | Daily XP; advisory lock |
| `submit_review_answer` | authenticated | Server-derived correctness |
| `submit_vocabulary_rating` | authenticated | Progress write |
| `record_lesson_progress` | authenticated | Progress write |
| `record_game_completion` | authenticated | Daily uniqueness |
| `enroll_in_free_package` | authenticated | Enrollment write |
| Community write/read RPCs | authenticated | Actor from `auth.uid()` |
| Admin/content CMS RPCs | authenticated + server role check | Must not be anon; staff-only grant is Phase 2 |
| `can_read_course` / `can_read_lesson` | authenticated / definer helper | Enrollment gate |
| `set_updated_at` | trigger | Not a client RPC |
| Edge Function service-role SQL | service_role only | Never browser |

## 2026-08-24 change

`20260824090000_revoke_anon_security_definer_execute.sql` walks public `SECURITY DEFINER` functions that `anon` can execute, revokes `PUBLIC`/`anon`, and re-grants `authenticated` + `service_role`. That removes anonymous execute without dropping learner RPCs.

Still open:

1. Classify each remaining function as public / authenticated / staff / owner / service-only / trigger-only.
2. Narrow staff/owner functions so `authenticated` learners cannot even call the stub.
3. Fix `set_updated_at` search_path if advisor still reports it mutable.
