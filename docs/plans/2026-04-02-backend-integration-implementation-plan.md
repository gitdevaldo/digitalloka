# Backend Integration Implementation Plan

Date: 2026-04-02
Owner: GitHub Copilot
Source PRD: `docs/prds/2026-04-02-backend-integration-full-deep-dive-prd.md`
Status: Execution-ready

## Tracker

| Track | Scope | Status | Priority | Target Output | Exit Criteria |
|---|---|---|---|---|---|
| T1 | Auth/session hardening and regression | Not Started | P0 | Stable login/callback/session lifecycle | No relogin loops, auth tests pass |
| T2 | User surface completion | Not Started | P0 | Reliable droplets/orders/entitlements/product-actions behavior | Ownership-safe user APIs and real action execution |
| T3 | Admin surface completion | Not Started | P0 | Full admin operations with strict audits | Admin APIs complete and audited |
| T4 | Commerce hardening | Not Started | P0 | Payment-confirmed order lifecycle and entitlement automation | No manual-only paid transitions |
| T5 | Security and policy verification | In Progress | P0 | App+DB defense-in-depth with repeatable checks | Same-origin, role, ownership, and RLS verified |
| T6 | Observability and operations | Not Started | P1 | Actionable logs, runbooks, and alarms | Incidents diagnosable without ad-hoc debugging |
| T7 | Testing and release readiness | Not Started | P0 | Integration and regression confidence | Release checklist satisfied |

Status legend:
- `Not Started`: no implementation merged
- `In Progress`: analysis or implementation underway
- `Blocked`: dependency gap preventing progress
- `Done`: implementation and verification complete

## Live Supabase Baseline (DATABASE_URL, Direct Postgres)

This plan is grounded on live database inspection via `DATABASE_URL` direct PostgreSQL connection.

### Verified Live Facts
- Connection: success to live database (`db_name=postgres`, `db_user=postgres`)
- Public tables: 11
- RLS-enabled tables: 10
- Current public tables: `audit_logs`, `entitlements`, `migrations`, `order_items`, `orders`, `product_categories`, `product_prices`, `products`, `site_settings`, `transactions`, `users`
- Current row counts:
  - `users`: 2
  - `migrations`: 11
  - `audit_logs`, `entitlements`, `order_items`, `orders`, `product_categories`, `product_prices`, `products`, `site_settings`, `transactions`: 0
- Policy counts by table:
  - `audit_logs`: 1
  - `entitlements`: 4
  - `order_items`: 4
  - `orders`: 4
  - `product_categories`: 4
  - `product_prices`: 4
  - `products`: 4
  - `site_settings`: 4
  - `transactions`: 4
  - `users`: 4
- Helper SQL functions present:
  - `is_active_user`
  - `is_admin`
  - `is_row_owner`

### Impact on Execution Order
- Seed/catalog/order test data must be created early because most business tables are currently empty.
- Security/policy validation can proceed immediately since policy footprint and helper functions exist.
- Auth and role tests can run immediately because `users` rows already exist.

## Implementation Strategy

### Guiding Principles
- Keep changes inside existing service boundaries.
- Complete P0 tracks before non-critical enhancements.
- Validate each phase with executable checks before moving forward.
- Maintain app-layer authorization even with RLS in place.

### Delivery Rhythm
- Phase-by-phase execution, each with:
  - implementation tasks
  - verification steps
  - rollback/fallback notes
  - explicit acceptance checks

## Phase 1: Auth and Session Hardening (T1)

### Goals
- Eliminate authentication regressions across `/login`, `/admin/login`, `/auth/callback`, and protected route access.
- Ensure cookie/session behavior is deterministic across local and production modes.

### Tasks
1. Add automated tests for magic-link initiation endpoint behavior.
2. Add tests for callback-to-session persistence flow.
3. Add tests for `supabase.auth` and `supabase.admin` middleware redirects.
4. Add tests for mode-aware fallback routes (`/dashboard`, `/admin`).
5. Add throttling/rate-limit policy for `POST /api/auth/login`.
6. Standardize failure payloads for auth endpoint errors.

### Verification
- Unauthenticated access to dashboard/admin routes redirects correctly with `next`.
- Successful callback sets both cookies and permits immediate protected-route access.
- Invalid token/cookie path returns 401/redirect without internal errors.
- Rate-limited login attempts return expected 429 behavior.

### Acceptance Criteria
- No relogin loop reproducible.
- Auth route and middleware tests pass.
- Auth rate-limiting enforced.

## Phase 2: User Surface Completion (T2)

### Goals
- Complete user-facing operational paths for droplets, orders, entitlements, checkout, and product actions.

### Tasks
1. Centralize droplet ID validation to remove repeated controller logic.
2. Enforce consistent ownership checks in all user read/write endpoints.
3. Replace placeholder user product action endpoint behavior with real queued jobs.
4. Add job processor logic per action type (`view_details`, `download_assets`, `renew`).
5. Add structured action result storage and audit hooks.
6. Add paginated consistency checks for orders and entitlements responses.

### Verification
- Cross-user access attempts fail reliably.
- Product actions are enqueued and transition to terminal states with traceable logs.
- Checkout remains atomic on failures.

### Acceptance Criteria
- No placeholder async behavior remains.
- Ownership-safe user APIs with tests.

## Phase 3: Admin Surface Completion (T3)

### Goals
- Complete all admin operations with strict authorization and audit integrity.

### Tasks
1. Add comprehensive tests for admin CRUD and status transitions.
2. Ensure all admin mutating endpoints write audit records with actor/target/change-set.
3. Validate admin droplet actions and provider failure mapping.
4. Harden site setting upsert validation for key/value shape consistency.
5. Add filter coverage tests for admin list endpoints.

### Verification
- Non-admin and inactive admin users are blocked everywhere.
- Admin mutation endpoints create deterministic audit log rows.

### Acceptance Criteria
- Admin API matrix fully operational and audited.

## Phase 4: Commerce Hardening (T4)

### Goals
- Move from manual payment assumptions to verified commerce lifecycle.

### Tasks
1. Integrate payment provider abstraction and webhook verification flow.
2. Gate `paid` order transition by payment confirmation.
3. Add idempotency keys for payment and webhook handling.
4. Add entitlement creation safeguards for duplicate events.
5. Add entitlement expiration and renewal automation (scheduled task).

### Verification
- Fake payment cannot transition order to `paid` without verification.
- Duplicate webhook events do not duplicate entitlements.
- Expired entitlements transition correctly.

### Acceptance Criteria
- Payment-confirmed lifecycle enforced end-to-end.

## Phase 5: Security and Policy Verification (T5)

### Goals
- Keep app checks and DB policies aligned and continuously verifiable.

### Tasks
1. Add a repeatable verification script that checks:
   - RLS enabled status on required tables
   - policy count drift
   - helper function existence
2. Add app-level authorization regression tests for ownership and role boundaries.
3. Validate same-origin coverage on every mutating route.
4. Add policy drift checks to deployment checklist.

### Verification
- RLS and policy checks pass against live DB.
- Authorization regression tests pass.
- No uncovered mutating routes.

### Acceptance Criteria
- Defense-in-depth checks reproducible and green.

## Phase 6: Observability and Operations (T6)

### Goals
- Improve diagnosis speed for auth, provider, and transaction incidents.

### Tasks
1. Add structured logs for auth/session failures.
2. Add provider-call correlation IDs for DigitalOcean and payment flows.
3. Add operational runbook for top failure modes.
4. Add basic alert definitions for repeated auth failures and provider error spikes.

### Verification
- Incident triage can identify actor, endpoint, provider call, and failure class quickly.

### Acceptance Criteria
- Operational playbook and logging baseline complete.

## Phase 7: Testing and Release Readiness (T7)

### Goals
- Ship with confidence across homepage, user dashboard, and admin dashboard integrations.

### Tasks
1. Build integration test matrix by endpoint family.
2. Add regression pack for auth redirects/callback/session.
3. Add seeded smoke tests for catalog and commerce.
4. Add release checklist with rollback notes.

### Verification
- Required test suites pass in CI.
- Release checklist complete with sign-offs.

### Acceptance Criteria
- Production readiness checklist complete.

## Work Breakdown and Ownership Matrix

| Area | Primary Files | Owner | Dependency |
|---|---|---|---|
| Auth/session | `app/Http/Controllers/Auth/*`, `app/Services/Auth/*`, `app/Http/Middleware/*` | Backend | Supabase auth config |
| User APIs | `app/Http/Controllers/User/*`, `app/Services/Commerce/*`, `app/Services/Access/*` | Backend | Seed data and queue infra |
| Admin APIs | `app/Http/Controllers/Admin/*`, `app/Services/Audit/*`, `app/Services/Settings/*` | Backend | Role fixtures |
| Droplets | `app/Http/Controllers/Droplets/*`, `app/Services/DigitalOcean/*` | Backend | DO token and provider availability |
| Policies | `docs/sql/*`, verification scripts | Backend/SRE | Live DB access |
| Tests | `tests/*` | Backend QA | Stable fixtures |

## Data Seeding Plan (Required Early)

Given live row counts are near-zero in business tables, create deterministic seed fixtures:
- 1 admin user, 1 regular user, optional inactive user
- product categories and products with active prices
- sample orders with transitions (`pending`, `paid`, `fulfilled`, `cancelled`)
- sample entitlements across statuses (`pending`, `active`, `expired`, `revoked`)
- minimal site settings and audit events

Seeding acceptance:
- All endpoint families have testable records.
- No manual ad-hoc DB mutation required for baseline QA.

## Risk Register

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| Auth regressions reintroduce login loops | High | Medium | Auth regression pack and middleware tests |
| Payment transition abuse without verification | High | Medium | Enforce provider-confirmed paid transition |
| Placeholder async actions left in production | High | Medium | Queue implementation as P0 in T2 |
| Policy drift between environments | High | Medium | Automated live policy verification in deploy checklist |
| Sparse live data hides integration bugs | Medium | High | Deterministic seed fixtures and smoke tests |

## Milestone Exit Checklist

- M1: Auth/session hardening merged and tests passing
- M2: User surface complete with real async actions
- M3: Admin surface complete with full audit coverage
- M4: Payment verification and entitlement automation live
- M5: Security/policy checks automated and green
- M6: Full regression suite and release checklist complete

## Immediate Next 10 Execution Tasks

1. Add auth/session regression tests for callback and middleware gates.
2. Implement throttle on `POST /api/auth/login`.
3. Extract droplet ID validation into shared request/validator.
4. Replace user product action placeholder with queue + jobs.
5. Add product action result persistence and user-visible status endpoint.
6. Add admin mutation audit assertions in tests.
7. Implement payment provider adapter and verified paid transition gate.
8. Add entitlement expiration scheduler and tests.
9. Add live RLS/policy verification script for deployment pipeline.
10. Add seeded smoke tests for homepage, user dashboard, and admin dashboard flows.
