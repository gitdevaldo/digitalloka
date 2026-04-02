# Backend Integration Full Deep Dive PRD

Date: 2026-04-02
Owner: GitHub Copilot
Status: Draft for implementation alignment

## 1. Objective

Define a complete backend integration product requirements document for this Laravel application, covering:
- Homepage and public catalog integration
- User dashboard integration
- Admin dashboard integration
- Authentication/session integration
- Service boundaries, validation, error handling, and security
- Database integration constraints and backend roadmap

This PRD is implementation-focused and references current code behavior and integration gaps.

## 2. Product Scope

### In Scope
- Laravel backend APIs and web routes
- Supabase Auth integration (magic link + session handling)
- Supabase Postgres integration via Eloquent
- DigitalOcean API integration via service layer
- Validation contracts and response contracts
- Access control and middleware behavior
- Integration gaps and acceptance criteria

### Out of Scope
- Frontend visual redesign
- Replacing Supabase Auth provider
- Replacing Laravel framework
- Rewriting archived legacy implementation

## 3. System Context

The platform has two major interaction surfaces:
1. Public/catalog surface (homepage and product browsing)
2. Authenticated surfaces:
   - User dashboard
   - Admin dashboard

Backend architecture is service-oriented with controller -> service -> model/provider boundaries.

## 4. Architecture and Module Boundaries

### 4.1 Layers
- Routes: web and api route maps
- Controllers: endpoint and page handlers by domain
- Middleware: origin, auth, role enforcement
- Services: auth, access, digitalocean, catalog, commerce, settings, audit
- Models: users/orders/products/prices/entitlements/transactions/settings/audit logs
- Database migrations: canonical schema source

### 4.2 Integration Boundary Rules
- All DigitalOcean calls must go through DigitalOcean service layer
- Auth/session user resolution must go through Supabase auth service
- Access checks must be explicit in endpoint handlers
- Mutating endpoints must enforce same-origin
- Validation must use Laravel request validation rules

## 5. Functional Requirements by Surface

## 5.1 Homepage and Public Catalog

### FR-HOME-01 Product list endpoint
- Public endpoint must return visible catalog products with pagination and filter support.
- Supported filters/sort include category/search/price/rating/tags/badges and ordering.
- Product list payload must include category and active price context for card rendering.

Acceptance:
- Homepage can render product cards from API only.
- Invalid query values return validation errors, not server errors.

### FR-HOME-02 Product detail endpoint
- Public endpoint must return one visible product by slug.
- Response must include category and active pricing options.

Acceptance:
- Unknown slug returns not found.
- Hidden/unavailable products are not exposed through public route.

### FR-HOME-03 Magic-link hash handling from root
- If auth provider redirects to root with token hash, backend session must still be established and then redirect to intended destination.

Acceptance:
- Root hash login persists session and redirects correctly.
- Missing next path falls back by mode-aware defaults.

## 5.2 User Dashboard

### FR-USER-01 Dashboard page protection
- All dashboard web routes must require authenticated Supabase session.
- Unauthenticated requests must redirect to user login with next path.

Acceptance:
- Direct access to dashboard without session redirects to login.
- With valid session, page resolves without re-login loop.

### FR-USER-02 Orders integration
- User orders list/detail endpoints must enforce ownership by user id.
- Response should include items and transaction context.

Acceptance:
- User cannot retrieve another user orders.
- Invalid ids return typed errors.

### FR-USER-03 Entitlements integration
- User products endpoint returns own entitlements with product context.
- Status lifecycle must be reflected in payload.

Acceptance:
- Only user-scoped records are returned.
- Pagination works for large entitlement sets.

### FR-USER-04 Droplets integration
- User droplets endpoint returns only assigned droplets.
- Actions endpoint must enforce ownership and action validation.

Acceptance:
- Unauthorized droplet action returns forbidden.
- Allowed actions map to provider action API correctly.

### FR-USER-05 Checkout integration
- Checkout endpoint must create order + item + transaction atomically.
- Input validation must reject invalid product/price/quantity combinations.

Acceptance:
- Order write is transactional.
- Any failure rolls back all related writes.

## 5.3 Admin Dashboard

### FR-ADMIN-01 Admin web access
- Admin web routes must require authenticated + active admin role.
- Non-admin authenticated users must be redirected/blocked.

Acceptance:
- Admin routes inaccessible for non-admin role.
- Active role check enforced.

### FR-ADMIN-02 Users management
- Admin users list/detail/update-access endpoints must support search and role/status updates.
- Every mutating action must produce audit log entry.

Acceptance:
- Role and is_active updates persist correctly.
- Audit log captures actor, target, and change diff.

### FR-ADMIN-03 Orders operations
- Admin can list/filter orders and change order status with transition guards.
- Paid transition must trigger entitlement creation behavior.

Acceptance:
- Invalid transitions are rejected.
- Valid transitions update order + dependent state.

### FR-ADMIN-04 Products operations
- Admin products endpoints support list/create/update.
- Validation for core product attributes is enforced.

Acceptance:
- Create/update fails on invalid payload.
- Successful mutations are audited.

### FR-ADMIN-05 Entitlements operations
- Admin entitlements list and status update endpoints enforce lifecycle transitions.
- Revoke must capture reason and timestamps.

Acceptance:
- Invalid status transitions rejected.
- Revoke metadata persisted.

### FR-ADMIN-06 Droplet operations
- Admin droplets endpoint aggregates provider state and owner mapping.
- Admin droplet actions route can trigger provider actions with typed error mapping.

Acceptance:
- Response includes owner linkage and infra metadata.
- Provider failures return controlled service errors.

### FR-ADMIN-07 Site settings and audit logs
- Admin settings upsert/list endpoints must support grouped retrieval.
- Admin audit endpoint supports filtering and pagination.

Acceptance:
- Settings writes validated and persisted.
- Audit endpoint returns deterministic response shape.

## 6. Authentication and Session Integration Requirements

### FR-AUTH-01 Magic link initiation
- Auth login endpoint accepts email and optional mode/next context.
- Redirect URL to provider must preserve safe next and mode.

Acceptance:
- Email link contains callback context for user/admin routing.

### FR-AUTH-02 Callback/session establishment
- Callback flow must persist session via backend endpoint before redirect.
- Cookies must be set with correct attributes for local/prod behavior.

Acceptance:
- Session cookie exists before protected route load.
- No immediate relogin loop after successful callback.

### FR-AUTH-03 Cookie compatibility
- Supabase cookies must be excluded from Laravel encryption/decryption path where required.
- Token extraction must support bearer, cookie API, and raw cookie header fallback.

Acceptance:
- Token readable in authenticated middleware checks.
- Cookie parsing edge cases do not break auth.

### FR-AUTH-04 Local fallback controls
- Local JWT fallback may be enabled only for dev resilience.
- Production must rely on provider verification path and secure TLS verification.

Acceptance:
- Environment flags control behavior explicitly.
- Production defaults preserve strict verification.

## 7. Security Requirements

### FR-SEC-01 Origin checks on mutation
- All state-changing API endpoints must require same-origin.

### FR-SEC-02 Role and ownership checks
- Admin role required for admin endpoints.
- Ownership required for user resource access.

### FR-SEC-03 Secret handling
- No secrets exposed in responses or logs.
- Service keys remain server-side only.

### FR-SEC-04 Database-layer enforcement alignment
- RLS/RBAC policy model must align with app-level access logic.

## 8. Data Model and Integration Contracts

Core entities:
- users
- product_categories
- products
- product_prices
- orders
- order_items
- transactions
- entitlements
- site_settings
- audit_logs

Contract expectations:
- All API responses use stable keys per endpoint domain.
- IDs and status fields must be type-consistent.
- Pagination shape should remain consistent within endpoint families.

## 9. Error and Response Standards

### Typed Error Outcomes
- 400 invalid input format
- 401 unauthenticated
- 403 unauthorized/forbidden
- 404 missing resource
- 422 validation/state transition violation
- 502 external provider failure
- 503 upstream auth/service unavailable

### Response Shape Requirements
- Mutation success should be explicit and predictable
- Collection endpoints should support pagination metadata
- Error bodies should expose actionable and non-sensitive messages

## 10. Integration Gaps and Risks

### Gap-G01 Payment integration incomplete
- Current checkout flow writes pending/manual transactions; gateway settlement integration remains incomplete.

### Gap-G02 Async product action execution incomplete
- User product action endpoint returns accepted without full queue-backed execution path.

### Gap-G03 Droplet assignment management surface
- Assignment governance for user droplet IDs requires robust admin workflows and validation hardening.

### Gap-G04 Entitlement expiry enforcement
- Expiration policy enforcement needs scheduled and query-level consistency checks.

### Gap-G05 Operational diagnostics
- Need explicit integration observability for auth/session/provider failures.

## 11. Non-Functional Requirements

- Reliability: graceful degradation on provider failure
- Observability: structured logs for auth/provider failures
- Performance: pagination and constrained eager loads for large datasets
- Security: strict production TLS verification and disabled local-only fallbacks
- Maintainability: preserve service boundaries and typed endpoint behavior

## 12. Delivery Plan (Backend Integration Focus)

### Phase 1: Authentication and Session Hardening
- Finalize callback/session flow and env defaults by environment
- Validate admin/user mode-aware redirect behavior
- Add test coverage for session persistence and middleware gating

### Phase 2: User Surface Integration Completion
- Verify droplets/orders/entitlements contracts end-to-end
- Complete product action backend execution path

### Phase 3: Admin Surface Integration Completion
- Complete admin operations and audit contract verification
- Harden droplet ownership/assignment management workflows

### Phase 4: Commerce and Fulfillment Integration
- Add payment gateway and webhook reconciliation
- Enforce entitlement lifecycle transitions with automation

### Phase 5: Hardening and Regression
- Integration regression suite for homepage, user dashboard, admin dashboard
- Security and performance validation

## 13. Acceptance Criteria (Overall)

- Homepage data fully backed by validated APIs with stable contracts
- User dashboard routes and APIs are session-protected and ownership-safe
- Admin dashboard routes and APIs are role-protected and auditable
- Magic-link login reliably establishes session without relogin loops
- Production-safe security defaults documented and enforceable
- Backend integration gaps prioritized with implementation-ready requirements

## 14. Implementation Notes for Next Step

When starting backend integration work from this PRD:
- Begin with auth/session and middleware verification test matrix
- Then address provider integration gaps (payment and product actions)
- Keep all mutations audited
- Keep DigitalOcean and Supabase interactions encapsulated in service layer
