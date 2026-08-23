# TOKUTEI GINO

## Product

TOKUTEI GINO is a Japanese Tokutei Ginou learning app for Vietnamese learners living in Japan. Production uses real Supabase data; demo data is created only by the explicit cloud-demo scripts.

## Stack

- React 19, TypeScript, Vite, React Router, Zustand, Tailwind CSS v4.
- Supabase Cloud: Auth, PostgreSQL, RLS, RPC, Storage and Deno Edge Functions.
- GitHub Pages serves the Vite app under `/Gino2/`.

## Architecture

```text
Browser
  -> feature repository
  -> Supabase RLS/RPC or authenticated Edge Function
  -> PostgreSQL / Storage / external provider
```

Pages orchestrate UI. Repositories own Supabase calls. Server-side RLS, RPC and Edge Functions are the source of truth for roles, enrollment, scores, rewards, quotas and provider results. Do not put Supabase mutations in presentation components.

## Directory structure

```text
src/app/                 router, layouts and error boundary
src/features/<domain>/   pages, components, repositories and pure helpers
src/shared/              reusable UI and assets
public/                  service worker and static assets
supabase/migrations/     append-only database migrations
supabase/functions/      Deno Edge Functions and shared HTTP helpers
scripts/                 security, timezone and demo-data checks
docs/                    architecture, security, hardening and release docs
.github/workflows/       GitHub Pages, notification and smoke-test workflows
```

## Environment variables

Names only; keep values in local ignored files or the appropriate CI/Supabase secret store.

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_DATA_MODE
GITHUB_PAGES
DISABLE_HMR
PLAYWRIGHT_BASE_URL

SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
APP_ORIGIN
PUBLIC_APP_URL
GEMINI_API_KEY
GEMINI_MODEL
GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON
RESEND_API_KEY
RESEND_FROM_EMAIL
NOTIFICATION_DISPATCH_SECRET
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT

DEMO_ADMIN_PASSWORD
DEMO_LEARNER_PASSWORD
DEMO_EDITOR_PASSWORD
DEMO_SUPPORT_PASSWORD
DEMO_ANALYST_PASSWORD
RESET_DEMO_PASSWORD
```

Never place service-role, provider, webhook, signing or demo passwords in `VITE_*`, URLs, commits or logs.

## Local development

```bash
npm ci
cp .env.example .env
npm run dev
```

Vite serves on port `3000` by default and binds to all interfaces for LAN testing. Set `VITE_DATA_MODE=real` when testing real Supabase data. Local Supabase commands require Docker:

```bash
supabase start
supabase db reset
```

## Typecheck, lint, tests and build

```bash
npm run typecheck
npm run lint
npm run test
npm run test:legacy
npm run build
```

Browser smoke tests require Chromium:

```bash
npx playwright install chromium
npm run test:e2e:smoke
```

Edge Function checks:

```bash
deno check supabase/functions/ai-chat/index.ts supabase/functions/ai-speaking/index.ts
deno test --allow-env supabase/functions/
```

## Supabase migrations

Migrations in `supabase/migrations/` are append-only. Never edit an applied migration. Review RLS, grants, `SECURITY DEFINER` search paths, actor derivation and rollback impact before applying a new one.

```bash
supabase migration list
supabase db push --linked --dry-run
supabase db push --linked
```

Apply database changes before deploying code that depends on them. Use isolated test users for authorization checks and do not run destructive attack tests against production learners.

## Edge Functions

Current functions are `admin-invite-user`, `ai-chat`, `ai-speaking`, `ai-writing` and `notification-dispatch`; shared authentication, origin checks and sanitized errors live in `supabase/functions/_shared/`.

Deploy only the changed function after `deno check` and review:

```bash
supabase functions deploy <function-name>
```

Set secrets through Supabase secret management. Do not print secret values. `notification-dispatch` is scheduled by GitHub Actions and authenticates with its dedicated dispatch secret.

## Deployment

Pushing `main` runs `.github/workflows/deploy.yml`. The workflow installs with `npm ci`, runs lint, tests, typecheck and build, sets `GITHUB_PAGES=true`, creates the SPA `404.html` fallback and deploys `dist` to GitHub Pages.

Production URL: `https://dangdinhluc.github.io/Gino2/`

Database and Edge Function deployments are separate from GitHub Pages. Verify the linked Supabase project, migration history, function secrets, CORS/origin rules and authenticated flows before calling a release complete.

## Security model

- The browser is untrusted; UI visibility is not authorization.
- RLS protects direct reads and RPCs perform sensitive mutations with `auth.uid()`-derived actors.
- Service-role access is server-only inside Edge Functions and dispatch jobs.
- Edge Functions authenticate bearer tokens, enforce allowed origins/enrollment where applicable, apply rate/quota checks and return sanitized errors.
- Gemini keys stay in Edge Function headers, never provider URLs or logs.
- Quota is currently consumed before the provider response; changing to success accounting is a separate schema-reviewed task.
- Browser-supplied `courseContext` remains a backlog item; future design should send `courseId`, verify enrollment and load approved context server-side.

## Admin roles

Admin access is verified from `admin_roles` on the server. The supported roles are:

- `owner`: full administration and staff/commerce controls.
- `content_editor`: content authoring and publishing workflow within granted sections.
- `instructor_support`: learner support and intervention workflows.
- `analyst`: analytics and read-oriented operational views.

The dashboard loads only the active section and direct table sections use server pagination/counts. Exact authorization remains in repositories, RPCs and RLS; do not infer permission from navigation alone.

## Release checklist

1. Review the scoped diff and run `git diff --check`.
2. Run install, typecheck, lint, unit/legacy tests and build.
3. Review new migrations and verify linked-project migration state, RLS and effective grants.
4. Run `deno check` for changed functions; deploy only the changed functions and verify sanitized unauthenticated/error flows.
5. Confirm CI Pages deployment and open the production base path.
6. Test login, learner route protection, admin denial for learners, course workspace, notifications and any changed AI/push flow.
7. Distinguish local validation from live Supabase, deployed runtime and physical-device results.

Further operational detail:

- [Architecture](docs/ARCHITECTURE.md)
- [Security model](docs/SECURITY_MODEL.md)
- [Production hardening plan](docs/PRODUCTION_HARDENING_PLAN.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Payment architecture](docs/PAYMENT_ARCHITECTURE.md)
