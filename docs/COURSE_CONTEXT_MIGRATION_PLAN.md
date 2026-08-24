# Active Learning Course

## Flow

- `/app` loads the persisted learner course context.
- No active enrollment redirects to `/app/courses?mode=select`.
- A learner with an active course goes to `/app/dashboard` (Hôm nay).
- The Course tab owns My Courses, switching, and course discovery.
- Learning surfaces receive the active course from the shared Zustand store; course workspace and game routes reject a different course id.

## Database change

Migration: `20260824041415_active_learning_course_context.sql`

- Adds nullable `profiles.active_course_id` with a foreign key to `courses`.
- Backfills existing learners deterministically from active enrollment, progress, and enrollment date.
- Adds `set_active_course(target_course_id)`; it verifies published course access server-side.
- Adds `enroll_in_free_course(target_course_id)`; it only enrolls through an active zero-price package and sets the active course in the same transaction.
- Adds `get_due_vocabulary_cards_for_course` so SRS cards are scoped to the active course.
- Grants the new functions to `authenticated` and `service_role`; `anon` has no execute privilege.

Paid courses continue through the existing package/enrollment workflow. The browser cannot grant itself paid access.

## Rollout and rollback

1. Apply the forward-only migration through the Supabase migration workflow.
2. Verify the column, function ACLs, and backfill counts.
3. Release the frontend; old profiles with a null value enter the selector once.
4. If the frontend must be rolled back, the nullable column and functions are backward-compatible and can remain in place. Do not delete the column while the new client is deployed.
5. Remove the column only in a later migration after all clients no longer reference it.

Production was updated with the migration file directly because the linked project contains historical migration versions that are not present in this checkout. Those unrelated history entries were not repaired or overwritten.
