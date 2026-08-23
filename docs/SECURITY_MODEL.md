# Security Model

## Trust boundaries

- Browser: untrusted. UI visibility is never authorization.
- Supabase RLS: protects direct reads; sensitive writes are RPC-only.
- RPC/SQL: derives actor from `auth.uid()`, validates input, calculates score/reward server-side.
- Edge Functions: authenticate bearer token, enforce origin, enrollment, server-side rate/quota, sanitize errors.
- Service role: Edge Function/dispatcher only. Never expose to Vite/browser.

## Community

Direct `INSERT`, `UPDATE`, `DELETE` are denied on community profiles, follows, posts, messages, blocks, reports, groups and memberships. Approved RPCs perform writes. Group membership defaults to `member`; no client role update path exists.

## Learning integrity

- Review correctness derives from selected option in DB.
- Assessment score derives from DB answer key.
- Lesson/course access checks enrollment/published status.
- Daily reward uses advisory lock and learner-local date.
- Game completion has server-side daily uniqueness.

## Staff

Admin route waits for staff verification. Learner session remains valid if role lookup fails. Server-side RPC/RLS remains final authority.

## Error handling and logs

Edge Functions map known codes to safe messages. Unknown errors return generic 500 and log sanitized error code/name server-side. Do not return database constraints, SQL detail, stack traces, provider responses, service keys or webhook secrets.

## Review checklist

- New `SECURITY DEFINER` function: fixed `search_path`, auth/role check, least execute grant, no trusted client user ID.
- New table: RLS, grants/revokes, direct mutation decision.
- New Edge Function: origin/auth/input/quota/error behavior.
- New payment/admin mutation: idempotency and audit trail.
- Test direct API/table access, not only UI.
