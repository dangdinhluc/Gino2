# Release Checklist

## Before merge

- [ ] Scoped diff reviewed; no unrelated WIP staged.
- [ ] `npm ci`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `git diff --check`
- [ ] New migrations reviewed for RLS, grants, rollback and data impact.
- [ ] New Edge Function errors sanitized.

## GitHub repository settings

- [ ] Protect `main`: require a pull request, require the Quality Gate workflow, dismiss stale reviews, and block direct pushes.
- [ ] Do not deploy preview/UX branches from the production Pages workflow.
- [ ] Close or rebase stale PRs before they drift from `main`.
- [ ] Delete merged feature branches after the PR lands.

## Database change

- [ ] Confirm linked project ref and migration state.
- [ ] Run `supabase db push --linked --dry-run`.
- [ ] Backup public schema/data when DB credentials available.
- [ ] Apply migration before dependent function/frontend deployment.
- [ ] Verify catalog: migration history, RLS, policies, effective table/RPC grants.
- [ ] Test with isolated test users; never run destructive attack tests against production learners.

## Edge Function change

- [ ] `deno check supabase/functions/<name>/index.ts`
- [ ] Deploy exact changed functions.
- [ ] Verify CORS, unauthenticated response and sanitized server failure.
- [ ] Confirm secrets exist without printing them.

## GitHub Pages

- [ ] Push `main` only after gates pass.
- [ ] Confirm Actions Pages workflow success.
- [ ] Open `https://dangdinhluc.github.io/Gino2/`.
- [ ] Check login, protected learner route, admin denial for learner, course workspace and notification navigation.

## Rollback

- Frontend: revert commit and push `main`.
- Edge Function: deploy prior revision.
- Migration: write explicit forward rollback migration; do not edit applied production migration.
- Payment/entitlement: reconcile through audited server action only.
