# Laravel Product Expansion Implementation Plan

Date: 2026-04-01
Status: Planned
Source PRD: docs/prds/2026-04-01-laravel-product-expansion-prd.md

## 1. Goal

Implement the Laravel product expansion defined in the PRD with phased delivery for:
- Homepage product discovery (list/filter/sort/detail entry)
- User dashboard product and order management
- Admin dashboard operational controls

Critical rule:
- Existing droplet management behavior must remain stable and secure.

## 2. Delivery Strategy

Execution model:
1. Build secure data and API foundation first.
2. Ship public homepage next.
3. Expand user dashboard.
4. Deliver admin dashboard.
5. Run hardening and release validation.

Quality gates:
- Security gate before each phase release.
- Regression gate for droplet routes before and after each phase.
- Phase acceptance criteria must be met before moving forward.

## 3. Implementation Phases

## Phase 0: Clarification and Design Lock

Objective:
- Close open decisions to remove implementation ambiguity.

Tasks:
1. Product taxonomy decision
- categories and product types for phase 1.

2. Pricing model decision
- single default pricing vs tiered pricing entries.

3. Admin role policy decision
- admin vs super-admin capabilities and boundaries.

4. Order status matrix
- allowed transitions and invalid transition behavior.

Outputs:
- Finalized decision memo.
- State transition tables for orders and entitlements.
- Role permission matrix.

Acceptance criteria:
- No unresolved blockers for schema or API design.

## Phase 1: Data and API Foundation

Objective:
- Implement core entities, services, and secured APIs.

Tasks:
1. Migrations
- products
- product_categories
- product_prices
- orders
- order_items
- transactions
- entitlements
- site_settings
- audit_logs

2. Models and relationships
- Eloquent models and relation mapping.
- Indexes for list/filter/sort routes.

3. Services
- Catalog service
- Order service
- Product access/entitlement service
- Site setting service
- Audit logging service

4. API controllers + requests
- Public products list/detail
- User products/orders endpoints
- Admin products/users/orders/settings endpoints
- Validation rules and typed error response strategy

5. Security controls
- Session/auth checks on protected routes
- Ownership checks for user resources
- Same-origin and CSRF checks on mutating routes
- Admin role enforcement

Outputs:
- Running API endpoints for all phase-1 domains.
- Request validation classes for every write endpoint.

Acceptance criteria:
- All phase-1 API requirements in PRD are implemented.
- Unauthorized access attempts return expected 401/403.
- Invalid payloads return structured 422 responses.

## Phase 2: Homepage Product Discovery

Objective:
- Launch public product listing experience with filtering and sorting.

Tasks:
1. Routes and controllers
- public homepage
- product detail entry route

2. UI components
- product cards with key data fields
- filter controls (category/type/availability/price)
- sorting controls
- pagination controls

3. Query-state behavior
- URL query sync for filters/sort/page.

4. Performance baseline
- optimize list query and indexes
- cache strategy for read-heavy list endpoint

Outputs:
- Public homepage and product detail entrypoint live.

Acceptance criteria:
- FR-H1 to FR-H4 are fully functional.
- Performance target for listing route is met or explicitly measured with mitigation plan.

## Phase 3: User Dashboard Expansion

Objective:
- Enable user self-service for products and orders while retaining droplet workflows.

Tasks:
1. Dashboard IA updates
- add products and orders navigation sections.

2. Purchased products module
- entitlement/access status display
- product-level action surface where needed

3. Orders module
- order list and detail views
- status and metadata visibility

4. Droplet continuity validation
- verify existing droplet views and actions unaffected.

Outputs:
- User dashboard supports both droplets and product/order operations.

Acceptance criteria:
- FR-U1 to FR-U5 implemented.
- No regression in droplet user journeys.

## Phase 4: Admin Dashboard

Objective:
- Deliver centralized admin operations surface.

Tasks:
1. Admin IA and nav
- /admin overview
- /admin/products
- /admin/users
- /admin/orders
- /admin/settings

2. Product management module
- list/create/update visibility and metadata
- pricing and category controls

3. User management module
- user list/search/detail
- role and active-status updates

4. Order management module
- order list/filter/search/detail
- controlled status update actions

5. Site settings module
- grouped settings read/write
- auditable update flow

6. Audit logging
- actor/action/target metadata for critical admin actions

Outputs:
- Admin dashboard with secured operational modules.

Acceptance criteria:
- FR-A1 to FR-A6 implemented.
- Non-admin access blocked by default.

## Phase 5: Hardening and Release Readiness

Objective:
- Validate security, reliability, performance, and observability before broad rollout.

Tasks:
1. Security verification
- auth guard verification across protected routes
- ownership and role-policy tests
- same-origin checks for mutations

2. Regression validation
- full droplet route regression suite
- product/order/admin feature suite

3. Performance tuning
- route-level metrics and slow-query checks
- index adjustments and query optimization

4. Observability baseline
- error/event logging for critical transitions
- dashboard metrics for key KPIs

5. Release and rollback playbook
- canary strategy
- rollback criteria and switching process

Outputs:
- Hardening report and go-live checklist.

Acceptance criteria:
- No unresolved high-severity issues.
- Regression suite pass for droplet-critical paths.

## 4. Work Breakdown Structure

Backend work packages:
- WP-BE-01 Schema + migrations
- WP-BE-02 Models + relationships
- WP-BE-03 Services + policy checks
- WP-BE-04 API endpoints + validation
- WP-BE-05 Audit and observability hooks

Frontend work packages:
- WP-FE-01 Homepage listing/filter/sort UX
- WP-FE-02 User dashboard products/orders modules
- WP-FE-03 Admin dashboard products/users/orders/settings modules
- WP-FE-04 Brand-guideline conformance and responsive behavior

QA work packages:
- WP-QA-01 API contract and security tests
- WP-QA-02 End-to-end critical journeys
- WP-QA-03 Regression coverage for droplets

## 5. Dependency Map

Critical path:
1. Phase 0 decisions -> schema and role policy implementation
2. Schema/services -> API endpoints
3. API endpoints -> homepage and dashboard UIs
4. Admin policy -> admin dashboard actions
5. Observability -> release validation and go-live

Parallel opportunities:
- Homepage UI shell can start once product list API contract is stable.
- Admin UI shell can start while deeper admin mutations are being finalized.

## 6. Testing Plan

Automated tests:
- Unit tests for services and transition logic.
- Feature tests for public/user/admin routes.
- Policy tests for ownership and admin authorization.
- Validation tests for all mutating requests.

Manual QA:
1. Visitor flow
- browse/filter/sort/open product detail.

2. User flow
- access products and orders.
- verify droplets still work.

3. Admin flow
- manage products/users/orders/settings.
- verify audit log entries for critical mutations.

4. Security flow
- unauthorized route access attempts.
- cross-user resource access attempts.

## 7. Definition of Done

Complete when:
1. PRD acceptance criteria are satisfied across homepage, user dashboard, and admin dashboard.
2. Security and policy enforcement validated for all protected operations.
3. Droplet behavior remains functional with no critical regression.
4. Observability and runbook coverage are in place.

## 8. Immediate Execution Sequence (Sprint 1 and Sprint 2)

Sprint 1:
- Phase 0 decisions
- Core schema/models/services
- Public products APIs
- User products/orders APIs baseline

Sprint 2:
- Homepage UI
- User dashboard products/orders UI
- Admin products/users/orders/settings baseline
- Regression and security checks

Exit target after Sprint 2:
- End-to-end functionality exists for all three requested surfaces, ready for hardening phase.
