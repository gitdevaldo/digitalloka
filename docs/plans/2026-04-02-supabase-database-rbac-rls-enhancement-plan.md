# Supabase Database, RBAC, and RLS Enhancement Plan

Date: 2026-04-02
Owner: GitHub Copilot
Status: Plan only (no DB changes executed in this plan)

## Goal

Harden Supabase database security and access control for this Laravel + Supabase architecture by implementing:
1. Complete RLS coverage on application tables.
2. DB-level RBAC/policy model aligned with user/admin behavior.
3. Auditable, repeatable SQL migration workflow for database policies.
4. Verification checks proving policy behavior by actor type.

## Scope

In scope:
- Supabase Postgres schema hardening for existing app tables.
- RLS enablement and policy implementation.
- Role/RBAC policy model for user and admin paths.
- Database-level verification and regression checklist.

Out of scope:
- UI changes.
- Application business-feature changes.
- Authentication provider replacement.

## Current Baseline (Observed)

Live direct PostgreSQL check confirmed:
- Connection to Supabase DB is successful.
- Required app tables exist: users, product_categories, products, product_prices, orders, order_items, transactions, entitlements, site_settings, audit_logs.
- RLS is enabled only on `users`.
- RLS is disabled on all other listed application tables.
- Policy count on app tables is minimal (not sufficient for production access enforcement).

Code-level security model currently active:
- App-side admin check via `users.role` in `AdminAccessService`.
- App-side user droplet ownership via `users.droplet_ids` in `DropletAccessService`.
- Same-origin check for mutating API requests via `EnsureSameOrigin` middleware.

Gap:
- Database layer does not yet enforce most access boundaries.

## Target Security Model

## Actor Model

1. Anonymous (`anon`)
- Can read only publicly visible catalog data.
- No access to user-owned or admin-owned data.

2. Authenticated User (`authenticated`)
- Can read/update only own resources (orders, entitlements, related items/transactions).
- No direct access to admin datasets.

3. Admin (`authenticated` + admin claim or admin lookup)
- Can read/write admin-managed datasets.
- Must remain auditable in `audit_logs`.

## Table Access Intent

1. `users`
- Self-read/update only for profile-safe columns.
- Admin read/update role and active status.

2. `product_categories`, `products`, `product_prices`
- Public read for visible/active catalog subset.
- Admin write for management.

3. `orders`, `order_items`, `transactions`, `entitlements`
- User read own rows only.
- Admin full operational access.

4. `site_settings`
- Admin read/write only.

5. `audit_logs`
- Admin read.
- Insert from trusted server path.

## Implementation Phases

## Phase 1: Policy Architecture Definition

Tasks:
1. Define final RBAC source for DB policies:
- Option A: JWT app metadata claim (`role`).
- Option B: DB lookup against `users.role` and `users.is_active`.

2. Define helper SQL functions:
- `is_admin()`
- `is_active_user()`
- `is_row_owner(user_id uuid)`

3. Decide strictness for user profile writes (column constraints).

Acceptance criteria:
- Single RBAC source of truth documented.
- Policy expression style finalized (claim-based vs table-lookup-based).

## Phase 2: Enable RLS on All App Tables

Tasks:
1. Enable RLS on:
- product_categories
- products
- product_prices
- orders
- order_items
- transactions
- entitlements
- site_settings
- audit_logs

2. Keep `users` RLS enabled and aligned with new policy set.

Acceptance criteria:
- `pg_tables.rowsecurity = true` for all target tables.

## Phase 3: Add Baseline Deny-by-Default Policies

Tasks:
1. Create explicit policies per table for anon/authenticated/admin.
2. Ensure no unintended default grants bypass policies.
3. Ensure no table remains readable by anon unless explicitly intended.

Acceptance criteria:
- Unauthorized select/update/insert/delete attempts fail as expected.

## Phase 4: User-Scoped Policies

Tasks:
1. Implement own-row access for users:
- `orders.user_id = auth.uid()`
- `entitlements.user_id = auth.uid()`
- `order_items` and `transactions` constrained through parent order ownership.

2. Restrict user access for `users` table to own record only.

Acceptance criteria:
- User A cannot access User B data in all user-owned tables.

## Phase 5: Admin Policies

Tasks:
1. Implement admin full-management policies for:
- products/product_prices/product_categories
- users
- orders/order_items/transactions
- entitlements
- site_settings
- audit_logs (read at minimum)

2. Ensure admin policies require active admin state.

Acceptance criteria:
- Non-admin authenticated users are denied admin table operations.
- Admin users can complete required operations.

## Phase 6: Privilege and Surface Hardening

Tasks:
1. Audit grants on schema/tables/sequences.
2. Revoke excessive privileges from broad roles.
3. Grant only required privileges to `anon` and `authenticated`.

Acceptance criteria:
- Grant matrix is minimal and documented.

## Phase 7: Verification and Regression Suite

Tasks:
1. SQL verification script:
- table existence
- rowsecurity flags
- policy list and coverage

2. Behavior verification matrix:
- anonymous actor
- regular authenticated user
- admin user

3. Application compatibility checks for:
- catalog endpoints
- user endpoints
- admin endpoints

Acceptance criteria:
- Verification script produces pass state for all policy assertions.
- No functional regressions on expected authorized paths.

## Deliverables

1. SQL migration package (versioned):
- `docs/sql/2026-04-02-supabase-rls-rbac.sql` (or equivalent migration script path used by team workflow)

2. Verification script:
- `docs/sql/2026-04-02-supabase-rls-rbac-verify.sql`

3. Policy matrix document:
- `docs/audits/2026-04-02-supabase-policy-matrix.md`

4. Runbook:
- Execution order, rollback strategy, and validation checklist.

## Proposed Execution Order

1. Define RBAC helper functions.
2. Enable RLS for all target tables.
3. Apply anon/authenticated policies for catalog + own-data tables.
4. Apply admin policies.
5. Apply privilege tighten pass.
6. Execute verification script.
7. Run app regression checks.

## Rollback Strategy

1. Keep all SQL changes in reversible, named transactions where possible.
2. Store policy drop/recreate statements in rollback section.
3. Roll back in reverse order:
- grants
- policies
- helper functions
- rowsecurity toggles (only if needed)

## Risk and Mitigation

Risk 1: Locking out valid app traffic.
- Mitigation: staged rollout by table group and actor-type tests after each phase.

Risk 2: Over-permissive admin bypass.
- Mitigation: centralized `is_admin()` function and strict policy review.

Risk 3: Query breakage from policy joins.
- Mitigation: pre-deploy explain checks and endpoint smoke tests.

## Acceptance Criteria (Overall)

1. RLS enabled for all application tables listed in this plan.
2. Policy coverage exists for user and admin access paths.
3. Unauthorized cross-user reads/writes are blocked at DB layer.
4. Authorized app operations continue to work.
5. Verification scripts and policy matrix are stored in repository.

## Next Step to Start Implementation

If approved, implement Phase 1 and Phase 2 first, then apply and verify policies table-by-table in Phase 3-5 with immediate verification after each batch.
