# Payment Architecture

Status: design only. No provider integration exists.

## Invariant

Browser never creates paid enrollment. Only verified provider webhook may unlock courses.

## Flow

1. Learner selects paid package.
2. Browser calls authenticated Edge Function `create-checkout` with package ID.
3. Function loads current package price/server configuration and creates provider checkout.
4. Provider redirects learner.
5. Provider webhook verifies signature and provider event ID.
6. Webhook transaction writes payment event, payment record, enrollment(s).
7. Repeated provider delivery is idempotent.
8. Browser reloads enrollments from RPC.

## Proposed tables

- `checkout_sessions`: provider session ID unique, learner, package, amount/currency snapshot, status, expires_at.
- `payments`: provider payment ID unique, checkout session, user, package, amount/currency, status, paid_at.
- `payment_events`: provider event ID unique, payment ID nullable, event type, verified payload metadata, received_at.

Never store full provider payload if it contains payment/card data. Store minimal redacted metadata.

## Authorization

- Checkout creation: authenticated learner only; package must be published/paid.
- Webhook: Edge Function only; signature verification before parsing business event.
- Enrollment: transaction after successful payment only.
- Refund/chargeback: server event changes entitlement per business policy.

## Failure handling

- Provider timeout: leave checkout pending, no enrollment.
- Duplicate webhook: unique event ID returns prior result.
- Amount/currency mismatch: record failed security event; do not enroll.
- Missing provider secret: fail closed with sanitized response/log code.

## Provider decision needed

Choose Japan-supported provider and legal/tax flow before migration: Stripe, PayPay, or other. Provider credentials, webhook secret, currency and refund policy are explicit blockers.

## Rollout

1. Migration with idempotent tables/indexes/RLS.
2. Edge checkout/webhook with test-mode provider.
3. Provider sandbox tests: success, duplicate, invalid signature, cancellation, refund.
4. Production secrets and webhook allow-list.
5. Enable paid package UI only after production webhook verifies.
