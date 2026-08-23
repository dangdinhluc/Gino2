# Architecture

## Frontend

React 19 + TypeScript + Vite. React Router owns routes. Zustand stores local UI state only. Tailwind v4 and `src/index.css` own visual styles.

## Feature boundary

`src/features/<domain>/` owns pages, components, repositories and pure helpers. Pages orchestrate UI. Repositories call Supabase/RPC. Do not put Supabase mutations inside presentation components.

## Backend

Supabase Cloud provides Auth, PostgreSQL, RLS, RPC, Storage and Edge Functions. `database.types.ts` is generated contract. Sensitive learner actions use RPC. AI/email/admin invitation use Edge Functions.

## Deployment

GitHub Pages publishes Vite output at `/Gino2/`. GitHub Actions runs test, typecheck and build before Pages deployment. Supabase migrations are separately applied to the linked Cloud project.

## Data flow

Browser → repository → Supabase RLS/RPC or Edge Function → PostgreSQL/Storage/provider.

Security/business decisions stay behind RLS/RPC/Edge Function. Browser is never source of truth for role, enrollment, score, XP, paid entitlement or provider result.

## Main directories

- `src/app`: router/layout/error boundary.
- `src/features`: learner/admin domains.
- `src/shared`: reusable UI and assets.
- `supabase/migrations`: append-only DB changes.
- `supabase/functions`: Deno Edge Functions.
- `docs`: production/security/release documents.

See `SECURITY_MODEL.md` and `RELEASE_CHECKLIST.md` for operational rules.
