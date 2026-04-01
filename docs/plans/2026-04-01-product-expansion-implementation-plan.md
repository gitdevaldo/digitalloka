# Product Expansion Implementation Plan

Date: 2026-04-01
Status: Planned
Source PRD: docs/prds/2026-04-01-product-expansion-prd.md
Reference Audit: docs/audits/2026-04-01-digicart-parity-deep-dive.md

## 1. Goal

Deliver DigitalLoka product expansion from droplet-only operations into a secure digital product platform with:
- Public catalog and product detail flow
- Customer product/order/entitlement dashboard
- Admin operations for orders, users, settings
- Parity foundations for license validation, affiliate tracking, and reminder automation

## 2. Delivery Principles

- Preserve existing droplet management behavior with zero regression.
- Enforce security-first backend controls on every protected endpoint.
- Release in phases with verifiable acceptance gates.
- Keep implementation modular by domain (catalog, commerce, access, admin, growth).
- Prefer deterministic state machines for order and entitlement transitions.

## 3. Scope Baseline

In this implementation plan:
- PRD phases 1 to 6 are translated into engineering workstreams.
- Each workstream includes tasks, outputs, dependencies, and acceptance criteria.
- Testing and rollout are defined per phase.

Not included in this plan execution:
- Full LMS delivery engine
- Advanced affiliate payout automation
- Full campaign/promotion orchestration

## 4. Architecture and Domain Boundaries

## 4.1 Domain Modules

1. Catalog
- Product taxonomy, listing, search/filter/sort, product detail data.

2. Commerce
- Checkout lifecycle, orders, order items, transactions, idempotent writes.

3. Access
- Entitlements, license issuance/validation/revocation, lifecycle states.

4. Customer Portal
- Dashboard modules for products, orders, entitlements/licenses, droplets.

5. Admin Core
- RBAC controls, order operations, user operations, site settings, audit logs.

6. Growth Foundation
- Affiliate account and referral tracking, reminder triggers, attribution hooks.

## 4.2 Cross-Cutting Concerns

- Auth and authorization: Supabase session + role-based policy checks.
- Security: same-origin and CSRF on mutating routes, validated payloads, safe error contracts.
- Observability: request tracing, transition logs, admin action audits.
- Performance: indexed filters, pagination, bounded query plans.

## 5. Implementation Phases and Milestones

## Phase 0: Discovery Closure and Technical Design (3-5 days)

Objective:
- Close open product and technical decisions that block execution.

Tasks:
1. Finalize taxonomy and pricing model:
- product types
- category hierarchy
- pricing variants/packages

2. Define state models:
- order status transitions
- entitlement lifecycle transitions
- transaction status mapping

3. Define role model:
- admin vs super-admin permission boundaries
- policy matrix for admin actions

4. Decide integration boundaries:
- payment provider strategy
- notification channels (email, WhatsApp, in-app)

Outputs:
- State transition specification
- Permission matrix
- Data dictionary v1
- API contract draft v1

Acceptance criteria:
- No unresolved blocker remains for schema and API implementation.
- State transitions are explicitly documented with allowed transitions.

## Phase 1: Data Layer and Core APIs (7-10 days)

Objective:
- Build robust database schema and backend APIs for catalog, commerce, access, and settings.

Tasks:
1. Migrations and schema:
- products, product_categories, product_prices
- orders, order_items, transactions
- entitlements, licenses
- affiliate_accounts, affiliate_referrals
- site_settings, audit_logs

2. Eloquent models and relationships:
- relation mapping and scopes
- soft deletes where required
- status enums/constants

3. Core services:
- CatalogService
- OrderService
- TransactionService
- EntitlementService
- LicenseService
- SettingsService

4. API endpoints (backend only):
- public: catalog list/detail
- user: purchased products, order history
- admin: order/user/settings operations

5. Validation and error mapping:
- request validation classes
- typed API responses
- idempotency handling for critical writes

6. Authorization policies:
- policy classes for user-owned resources
- admin role policies

Outputs:
- Migration set and seed baseline
- Service layer interfaces and implementations
- API route map with validation and policy checks

Acceptance criteria:
- All PRD core entities exist and migrate cleanly.
- API contracts return consistent, structured payloads.
- Unauthorized access and invalid transitions are blocked server-side.

## Phase 2: Public Experience (Homepage + Product Detail) (5-7 days)

Objective:
- Deliver conversion-ready catalog surface and product detail page.

Tasks:
1. Homepage catalog UI:
- product cards
- pagination
- filter panel
- sorting control

2. URL state synchronization:
- query params for filter/sort/pagination
- sharable and restorable URLs

3. Product detail page:
- package/pricing sections
- value blocks and FAQ sections
- CTA state handling

4. Performance optimization:
- query indexing
- response payload trimming
- cache strategy for read-heavy endpoints

Outputs:
- Public routes for homepage and product detail
- Catalog API integration with UI state

Acceptance criteria:
- FR-H1 to FR-H5 satisfied.
- Catalog and detail pages meet PRD performance targets.

## Phase 3: Customer Portal Expansion (6-8 days)

Objective:
- Add customer modules for products, orders, and access while retaining droplet continuity.

Tasks:
1. Navigation expansion:
- dashboard sections for products/orders/licenses
- preserve existing droplets route behavior

2. Purchased products module:
- entitlement status display
- validity/renewal state
- product action buttons

3. Order history module:
- list/detail views
- payment and fulfillment states

4. License/access module:
- visible licenses
- status and basic action flow

5. UX feedback layer:
- consistent success/error toasts
- inline error states

Outputs:
- User dashboard pages and APIs integrated
- Policy-guarded actions for owned resources

Acceptance criteria:
- FR-U1 to FR-U5 satisfied.
- Existing droplet dashboard functionality remains intact.

## Phase 4: Admin Dashboard Core (7-10 days)

Objective:
- Deliver operational control center with secure role-based capabilities.

Tasks:
1. Admin IA and navigation:
- overview, orders, users, settings sections

2. Orders management:
- filter/search/sort list
- order detail with line items and linked entitlements
- controlled status transitions

3. User management:
- user profile and purchase context
- account enable/disable
- entitlement adjustment tools

4. Site settings:
- grouped configuration UI
- safe update API and validation

5. Audit and safety controls:
- actor/action/target/timestamp logging
- confirmation patterns for destructive actions

Outputs:
- Admin routes, pages, APIs, and policy enforcement
- Audit logs for critical admin operations

Acceptance criteria:
- FR-A1 to FR-A5 satisfied.
- Non-admin access to admin routes is denied by default.

## Phase 5: Hardening and Readiness (5-7 days)

Objective:
- Ensure quality, resilience, and operational readiness before parity modules.

Tasks:
1. Security hardening:
- endpoint policy coverage audit
- CSRF/same-origin checks on mutating routes
- secret-safe logging review

2. Performance and indexing:
- load/profile key endpoints
- add/adjust indexes for filter-heavy queries

3. Reliability improvements:
- retry strategy for transient failures
- idempotency verification for order/entitlement writes

4. Monitoring and observability:
- event logs for state transitions
- dashboard metrics for core KPIs

Outputs:
- Security checklist sign-off
- Performance report and index plan
- Operational runbook v1

Acceptance criteria:
- PRD non-functional targets are met or documented with explicit exceptions.
- No critical/high security finding is open.

## Phase 6: Parity Growth Foundations (6-9 days)

Objective:
- Implement baseline parity modules for affiliate, reminders, and license API.

Tasks:
1. Affiliate baseline:
- affiliate account creation
- referral link generation
- referral event tracking
- commission ledger basics

2. Reminder automation:
- scheduled job framework
- lifecycle triggers (renewal, unpaid, expiry)
- template-driven notification dispatch

3. License validation API:
- generate license keys
- validate endpoint
- revoke endpoint
- usage/audit logging

4. Attribution hooks:
- pixel/tracking event points at key funnel actions

Outputs:
- Operational baseline for growth modules
- APIs and jobs ready for iteration

Acceptance criteria:
- FR-B4 and FR-B5 baseline satisfied.
- Growth KPIs can be measured from emitted events.

## 6. Detailed Work Breakdown Structure

## 6.1 Backend Work Packages

WP-BE-01 Schema and migrations
- Create migration files and constraints.
- Add indexes for filter/sort paths.
- Add foreign-key integrity and cascading policies.

WP-BE-02 Service layer
- Implement service boundaries for each domain.
- Ensure side effects happen through service orchestration only.

WP-BE-03 API contract and validation
- Implement request validators and resource transformers.
- Standardize success/error payload shape.

WP-BE-04 Policy and security controls
- Implement policy classes and middleware guards.
- Enforce deny-by-default posture for admin resources.

WP-BE-05 Background jobs
- Reminder scheduling jobs.
- Deferred workflow tasks and retries.

## 6.2 Frontend Work Packages

WP-FE-01 Catalog pages
- Build homepage listing and product detail.
- Implement filter/sort URL sync and loading states.

WP-FE-02 Customer dashboard modules
- Build products, orders, and licenses sections.
- Integrate status chips and action surfaces.

WP-FE-03 Admin dashboard modules
- Build order/user/settings operations pages.
- Add confirmation and validation feedback UX.

WP-FE-04 Design compliance
- Ensure UI matches frontend brand guideline.
- Verify mobile and desktop responsiveness.

## 6.3 Platform and Ops Work Packages

WP-OPS-01 Logging and monitoring
- Add application event logs for key transitions.
- Define alert thresholds for failures.

WP-OPS-02 Data lifecycle
- Backup and migration rollback strategy.
- Data retention rules for logs and audit data.

WP-OPS-03 Release gates
- Pre-release checklist and rollback playbook.

## 7. Dependency Map

Critical path dependencies:
1. State model decisions -> schema design
2. Schema design -> service implementation
3. Service implementation -> API delivery
4. API delivery -> frontend modules
5. Policy controls -> admin/customer launch
6. Event instrumentation -> KPI reporting

Parallelizable streams:
- Public catalog FE can start once catalog API contract is stable.
- Admin UI scaffolding can start while backend status transitions finalize.
- Reminder job framework can be scaffolded before final template content.

## 8. Testing Strategy

## 8.1 Automated Tests

Backend:
- Unit tests for services and transition validators
- Feature tests for public, user, and admin endpoints
- Policy tests for ownership and role restrictions
- Idempotency tests for retry-safe mutations

Frontend:
- Component tests for critical state rendering
- Integration tests for filter/sort URL state behavior
- Dashboard workflow tests for core user/admin journeys

## 8.2 Manual QA Scenarios

1. Visitor journey:
- browse, filter, sort, open detail, start checkout

2. Customer journey:
- view purchased products, order history, entitlement states, droplet continuity

3. Admin journey:
- process order transitions, adjust access, update settings, verify audit logs

4. Security journey:
- unauthorized API access attempts
- cross-user resource access attempts
- invalid status transition attempts

## 8.3 Regression Suite (Non-negotiable)

- Existing droplet routes and actions
- Existing auth/session behavior
- Existing ownership checks for droplets

## 9. KPI Instrumentation Plan

Events to emit:
- catalog_viewed
- catalog_filter_applied
- product_clicked
- checkout_started
- order_created
- entitlement_created
- entitlement_updated
- license_validated
- admin_order_transitioned
- reminder_sent
- affiliate_referral_recorded

Dashboards:
- discovery funnel
- fulfillment latency
- entitlement reliability
- admin operation throughput
- growth module effectiveness

## 10. Risk Register and Mitigation Actions

Risk: scope overload across multiple domains
- Mitigation: strict phase gate criteria and feature flagging

Risk: entitlement edge-case complexity
- Mitigation: transition matrix tests and explicit invalid transition handling

Risk: admin mistakes impacting access
- Mitigation: confirmation step, reversible operations where possible, full audit trail

Risk: performance bottlenecks on catalog and admin lists
- Mitigation: index-first query design and pagination limits

Risk: drift from parity goals
- Mitigation: milestone reviews against parity audit checklist

## 11. Team and Responsibility Model

Suggested ownership:
- Backend lead: schema, services, API contracts, security policies
- Frontend lead: catalog, customer dashboard, admin dashboard UX
- Full-stack engineer: integrations, end-to-end workflow wiring
- QA: regression packs, security and transition scenario validation
- Product/Ops: taxonomy, policy decisions, notification content and rules

## 12. Definition of Done (Overall)

Implementation is complete only when:
1. PRD acceptance criteria are met per module.
2. Security and policy checks pass across public/user/admin boundaries.
3. Droplet management remains operational with no critical regressions.
4. KPI events are emitted and validated.
5. Documentation is updated for routes, services, transitions, and operations.

## 13. Immediate Execution Order (First 2 Sprints)

Sprint 1:
- Close decision blockers (state model, role model, taxonomy)
- Ship schema + model + core services for catalog/orders/entitlements
- Expose public catalog APIs and basic user product/order APIs

Sprint 2:
- Ship homepage + product detail
- Ship dashboard products/orders modules
- Ship admin orders/users baseline with audit logging

Exit criteria after Sprint 2:
- Public discovery and customer self-service are live
- Admin can process core operations safely
- System is ready for hardening and parity growth modules
