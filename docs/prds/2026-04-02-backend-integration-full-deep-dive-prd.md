# Backend Integration Full Deep Dive PRD

Date: 2026-04-02
Owner: GitHub Copilot
Status: Fresh top-down deep dive baseline

## 1. Objective

Produce one complete, implementation-grounded backend PRD for the current Laravel codebase that defines:
- Homepage/catalog backend behavior
- User dashboard backend behavior
- Admin dashboard backend behavior
- Authentication, authorization, and session handling
- Integration boundaries for Supabase and DigitalOcean
- Data model constraints, risks, and acceptance criteria

This document is based on current repository behavior, not future assumptions.

## 2. Product Scope

### In Scope
- Web routes and API routes in current Laravel app
- Controller-to-service integration paths
- Supabase auth and Postgres integrations
- DigitalOcean droplet proxy integration
- Validation, middleware, and error behavior
- Schema and policy alignment requirements

### Out of Scope
- Frontend visual redesign
- Replacing Supabase or DigitalOcean providers
- Archive migration/rewrite work

## 3. Current System Architecture

### 3.1 Layered Architecture
- Route layer: `routes/web.php`, `routes/api.php`
- Controller layer: domain handlers in `app/Http/Controllers/*`
- Middleware layer: origin and auth guards in `app/Http/Middleware/*`
- Service layer: `app/Services/*`
- Persistence layer: Eloquent models and migrations
- Provider layer: Supabase auth API + DigitalOcean API

### 3.2 Boundary Rules
- All DigitalOcean calls must flow through `DigitalOceanService`
- Session user identity must flow through `SupabaseAuthService`
- Admin checks must flow through `AdminAccessService`
- Droplet ownership checks must flow through `DropletAccessService`
- Mutating routes must enforce same-origin checks

## 4. Surface Requirements

## 4.1 Homepage and Public Catalog

### FR-HOME-01 Public product listing
- API must expose visible catalog products with pagination and filters.
- Filtering supports category, type, availability, search, rating, tags, badges, price range, and sort.

Acceptance:
- Invalid query input returns validation errors.
- Product cards can be rendered using API output only.

### FR-HOME-02 Product detail by slug
- API must return one product with category and active prices.

Acceptance:
- Unknown slug returns not found.
- Non-visible/non-available products are not publicly exposed.

### FR-HOME-03 Root/callback auth bridging
- If provider redirect lands at root/callback with tokens, session cookies must be persisted before protected navigation.

Acceptance:
- Successful login does not bounce back to login.
- Missing `next` falls back by mode (`/dashboard` or `/admin`).

## 4.2 User Dashboard

### FR-USER-01 Protected dashboard pages
- All `/dashboard*` pages must require valid Supabase-authenticated session.

Acceptance:
- Unauthenticated request redirects to `/login` with `next`.
- Valid session resolves dashboard page without loop.

### FR-USER-02 User droplet operations
- Users can list only assigned droplets.
- Users can view/actions only on owned droplet IDs.

Acceptance:
- Unauthorized droplet access returns forbidden.
- Invalid droplet IDs return typed client errors.

### FR-USER-03 User commerce visibility
- Users can list own orders, order details, and own entitlements.

Acceptance:
- Cross-user order/entitlement reads are blocked.
- Payloads include related item/transaction/product context.

### FR-USER-04 Checkout write path
- Checkout must write order, item, and transaction atomically.

Acceptance:
- Any write failure rolls back all transaction-scoped rows.

## 4.3 Admin Dashboard

### FR-ADMIN-01 Protected admin pages
- All `/admin*` pages must require authenticated active admin role.

Acceptance:
- Non-admin users are redirected/blocked.
- Inactive admins are blocked.

### FR-ADMIN-02 Product management
- Admin can list/create/update products with validation.

Acceptance:
- Invalid payloads return validation/state errors.
- Mutations are audit-logged.

### FR-ADMIN-03 User access management
- Admin can list/show users and update role/active state.

Acceptance:
- Role transitions are constrained to allowed role set.
- Audit log captures actor, target, and changes.

### FR-ADMIN-04 Orders and entitlements operations
- Admin can list/show/update order status.
- Admin can list/update entitlement status.

Acceptance:
- Invalid lifecycle transitions are rejected.
- Paid order transition creates entitlements.

### FR-ADMIN-05 Admin infrastructure operations
- Admin can list all droplets and trigger droplet actions.
- Admin can list audit logs and manage site settings.

Acceptance:
- Provider failures are mapped to controlled errors.
- Site settings write path is admin-only.

## 5. Route Matrix (Current)

### 5.1 Web Routes
- `/login`, `/admin/login`, `/auth/callback` public auth pages
- `/` and `/products/{slug}` public catalog pages
- `/dashboard*` guarded by `supabase.auth`
- `/admin*` guarded by `supabase.admin`

### 5.2 API Routes by Domain
- Auth: `POST /auth/login`, `POST /auth/session`, `POST /auth/logout`
- Droplets: user and admin droplet list/detail/actions
- Catalog: `GET /products`, `GET /products/{slug}`
- User: products/actions, orders/detail, checkout
- Admin: products, users, orders, entitlements, droplets, audit logs, settings

All mutating routes use `EnsureSameOrigin`.

## 6. Authentication and Session Requirements

### FR-AUTH-01 Magic-link initiation
- `POST /auth/login` validates input and calls Supabase OTP endpoint with callback URL context.

### FR-AUTH-02 Session persistence
- `POST /auth/session` must set `sb-access-token` and `sb-refresh-token` cookies with secure attributes.

### FR-AUTH-03 Session user resolution
- Token lookup order must support bearer token, cookie value, and raw cookie header fallback.
- Primary verification uses Supabase `/auth/v1/user`.
- Optional local JWT fallback is env-gated for development only.

### FR-AUTH-04 Middleware gates
- `supabase.auth` checks authenticated session for user pages.
- `supabase.admin` checks authenticated + active admin role for admin pages.

## 7. Authorization and Security Requirements

### FR-SEC-01 Same-origin enforcement
- Every state-changing route rejects mismatched origin with 403.

### FR-SEC-02 Ownership and role checks
- User access is scoped by `user_id` ownership and `droplet_ids` assignment.
- Admin access requires role in `admin|super-admin` and active user.

### FR-SEC-03 Secret handling
- No provider token leakage in responses or logs.
- Service role credentials remain server-side only.

### FR-SEC-04 App and DB defense-in-depth
- App-level checks must remain enforced even when RLS exists.
- RLS policy pack and verification SQL remain part of security baseline.

## 8. Service Map and Contracts

### Core Services
- `SupabaseAuthService`: magic link and session user resolution
- `DigitalOceanService`: list/detail/action/action-history for droplets
- `DropletAccessService`: assigned droplet ownership checks
- `AdminAccessService`: role/is_active admin checks
- `OrderService`: checkout, list/show, status transitions, entitlement creation
- `EntitlementService`: entitlement listing and state transitions
- `CatalogService`: product list/detail with filters
- `SiteSettingService`: grouped settings list/upsert
- `AuditLogService`: mutation auditing

### Contract Expectations
- Controllers remain thin: validate + authorize + delegate + map errors
- External provider failures map to typed 5xx responses
- State transitions are explicit and guarded

## 9. Data Model Requirements

Core entities:
- `users` (UUID, role, is_active, droplet_ids)
- `product_categories`, `products`, `product_prices`
- `orders`, `order_items`, `transactions`
- `entitlements`
- `site_settings`
- `audit_logs`

Schema expectations:
- Strong foreign-key integrity on commerce/entitlement tables
- JSON fields used intentionally for metadata and catalog tagging
- Indexes support list/filter patterns used by controllers/services

## 10. Validation and Error Contracts

Validation is enforced through dedicated request classes for catalog filters, droplet actions, checkout, and admin mutations.

Typed error targets:
- 400 invalid ID/format
- 401 unauthenticated
- 403 forbidden/origin mismatch
- 404 resource not found
- 422 validation or invalid state transition
- 502 provider failure

Response consistency requirements:
- Deterministic success keys for mutation responses
- Consistent pagination envelope for collections
- Non-sensitive, actionable error messages

## 11. Current Gaps and Risks

### G-01 Payment integration incomplete
- Transactions are created in manual/pending model; no live gateway settlement flow.

### G-02 Product action queue is placeholder
- User product action endpoint returns accepted without actual queued execution.

### G-03 Entitlement expiry automation missing
- No scheduled expiration/reconciliation flow despite `expires_at` support.

### G-04 Login request rate limiting absent
- Magic-link initiation lacks explicit throttle policy.

### G-05 Validation centralization gaps
- Some ID validations are repeated manually in controllers.

### G-06 Observability gaps
- Admin mutations are audited; user auth/checkout lifecycle observability is still partial.

## 12. Delivery Priorities

### Phase 1: Auth hardening and regression
- Add explicit auth/session integration tests across user/admin login and callback paths.
- Add rate limiting to login initiation.

### Phase 2: User operations completion
- Implement real queued processing for user product actions.
- Standardize droplet ID validation path.

### Phase 3: Commerce hardening
- Integrate payment gateway and verified paid transition flow.
- Add entitlement expiration/renewal automation.

### Phase 4: Observability and policy verification
- Expand logging and audit coverage for critical user flows.
- Keep RLS verification as repeatable operational check.

## 13. Acceptance Criteria

- Public catalog is fully API-backed with validated, predictable contracts.
- User dashboard routes and APIs are session-protected and ownership-safe.
- Admin dashboard routes and APIs are role-protected and audited.
- Magic-link flow reliably persists session cookies without login loop regression.
- Mutating routes enforce same-origin checks across all domains.
- Known gaps are prioritized into implementation phases with clear completion targets.
