# PRD: DigitalLoka Product Expansion (Homepage, User Product Dashboard, Admin Dashboard)

Date: 2026-04-01
Status: Draft
Owner: Product + Engineering
Stakeholders: Product, Engineering, Operations, Sales, Support

## 1. Executive Summary

DigitalLoka currently focuses on infrastructure operations for assigned droplets. This PRD defines the next product expansion into a broader digital product platform with three major additions:

1. Public Homepage with product catalog and filter controls.
2. Enhanced User Dashboard to manage purchased digital products (not only droplets).
3. Backend Admin Dashboard to manage orders, users, and site settings.

Goal: evolve DigitalLoka from droplet-control utility into a managed digital product platform while preserving current droplet management capability.

Audit alignment:
- This PRD now incorporates findings from `docs/audits/2026-04-01-digicart-parity-deep-dive.md` to align implementation priorities with Digicart-style market expectations.

## 2. Product Vision

DigitalLoka should provide a unified lifecycle for digital products:
- Discovery (homepage catalog)
- Purchase/order fulfillment lifecycle
- Customer self-service management
- Admin operations for catalog, orders, users, and settings

Primary principle:
- Keep operational reliability and security from the current droplet system while expanding commercial/product management capabilities.

## 3. Problem Statement

Current limitations:
- No structured product discovery surface.
- User dashboard cannot manage broader purchased products.
- Admin tasks are manual/fragmented (orders/users/settings not centralized in-app).

Business impact:
- Harder to scale product offerings.
- Higher support overhead.
- Slower order and entitlement operations.
- Limited marketing/discovery effectiveness.

## 4. Objectives

1. Launch a lightweight product homepage (catalog-first, not a full marketing website).
2. Add user product management views and actions to dashboard.
3. Build admin dashboard for operational control (orders, users, settings).
4. Preserve existing droplet management UX and security model.

Success outcomes:
- Increased product discovery and conversion from homepage traffic.
- Reduced support tickets for basic product management operations.
- Faster order handling and user/account operations by admin.

## 5. Scope

### In Scope (Phase 1)
- Public homepage product list + filtering/sorting.
- User dashboard modules for purchased product visibility and lifecycle actions.
- Admin dashboard for order management, user management, and site settings.
- Data model and API layer for products, orders, entitlements, and settings.
- Role-based authorization for admin features.

### In Scope (Parity Foundation Additions)
- Commerce domain completeness for digital products:
  - transactions model and payment state handling
  - deterministic order status transition rules
- Access domain completeness:
  - entitlement lifecycle states (active, expired, pending, revoked)
  - license key generation and validation endpoint foundation
- Growth domain foundation:
  - affiliate account/referral tracking model
  - attribution/pixel integration hooks
  - reminder/follow-up automation triggers

### Out of Scope (Phase 1)
- Full CMS or long-form marketing pages.
- Complex promotion engine (coupon stacking, campaign builder).
- Multi-tenant white-labeling.
- Native mobile apps.
- Advanced affiliate payout automation (manual review workflow allowed initially).
- Full LMS/course delivery engine (only access/entitlement foundation in this PRD).

## 6. Personas

1. Visitor/Prospective Customer
- Wants to browse products quickly.
- Needs clear category, price, and status visibility.

2. Customer/User
- Wants to see what they purchased.
- Wants to manage product-specific actions and status.
- Wants one dashboard for droplets + digital products.

3. Admin/Operator
- Needs reliable control over orders, user accounts, and site configuration.
- Needs clear status flows and auditability.

## 7. User Stories

### Homepage
- As a visitor, I can browse available digital products by category.
- As a visitor, I can filter by type, price range, and availability.
- As a visitor, I can sort products by relevance/newest/price.
- As a visitor, I can click a product to view details and purchase CTA.

### User Dashboard
- As a user, I can view all purchased digital products.
- As a user, I can view entitlement status per product.
- As a user, I can perform supported product actions (renew, view credentials/details, request support action where applicable).
- As a user, I can still manage droplets in the same dashboard.

### Admin Dashboard
- As an admin, I can list/filter/search orders and update status.
- As an admin, I can view user profile, purchases, and access state.
- As an admin, I can manage site settings and feature toggles.

## 8. Functional Requirements

## 8.0 Benchmark Alignment Requirements (from parity audit)

FR-B1 Conversion-first product structure
- Product detail pages must support value blocks, package/licensing options, FAQ sections, and clear purchase CTA states.

FR-B2 Member-area parity baseline
- Customer area must include modules for Products, Orders, Entitlements/Licenses, and Droplets in one unified navigation.

FR-B3 Operator visibility baseline
- Admin area must provide queue-friendly workflows for order state changes, entitlement changes, and user access support actions.

FR-B4 Automation baseline
- System must support lifecycle triggers (renewal reminders, payment follow-ups, expiry notifications) with template-driven notifications.

FR-B5 License validation baseline
- System must support generation, lookup, validation, and revocation for product licenses through server-side APIs.

## 8.1 Homepage (Catalog Surface)

FR-H1 Catalog listing
- Show paginated product cards with:
  - product name
  - short description
  - category
  - pricing display
  - status badge (available/out-of-stock/coming soon)
  - primary CTA

FR-H2 Filtering
- Filter controls:
  - product category
  - product type
  - price range
  - availability

FR-H3 Sorting
- Sort options:
  - default/recommended
  - newest
  - price low-high
  - price high-low

FR-H4 URL state
- Filter/sort/pagination reflected in URL query params.

FR-H5 Product detail navigation
- Click-through to product detail page (minimal detail in phase 1 allowed).

## 8.2 Enhanced User Dashboard (Customer Area)

FR-U1 Unified navigation
- Dashboard navigation includes:
  - droplets
  - purchased products
  - order history
  - account/profile

FR-U2 Purchased products module
- Show all purchased products with:
  - product name
  - current entitlement status
  - validity/renewal information
  - related order reference
  - product action buttons

FR-U3 Product action framework
- Product actions are type-specific and must be policy-driven.
- Minimum generic actions:
  - view details
  - view/download assets or credentials (if available)
  - renew/extend (if allowed)

FR-U4 Droplet continuity
- Existing droplet management flows remain available and unchanged in behavior.

FR-U5 Notifications and feedback
- Action success/failure toasts and clear status updates.

## 8.3 Admin Dashboard

FR-A1 Admin access control
- Admin dashboard accessible only for authorized admin roles.

FR-A2 Order management
- Order list with search/filter/sort by:
  - status
  - date range
  - user
  - product
- Order detail includes:
  - line items
  - payment status
  - fulfillment status
  - linked entitlements
- Admin can update status with validation rules.

FR-A3 User management
- User list with search/filter.
- User detail includes:
  - profile basics
  - purchase history
  - active entitlements
  - droplet assignments
- Admin actions:
  - enable/disable account
  - adjust entitlements
  - manage product access assignments

FR-A4 Site settings
- Settings groups:
  - branding basics
  - product visibility toggles
  - operational settings
  - support/contact settings
- Settings changes are versioned/auditable.

FR-A5 Audit trail
- Critical admin actions are logged with actor, action, target, timestamp.

## 9. Information Architecture

### Public
- `/` -> product catalog homepage
- `/products/{slug}` -> product detail

### Authenticated User
- `/dashboard` -> overview
- `/dashboard/droplets` -> droplet area
- `/dashboard/products` -> purchased products
- `/dashboard/orders` -> order history

### Admin
- `/admin` -> admin overview
- `/admin/orders` -> orders list/detail
- `/admin/users` -> users list/detail
- `/admin/settings` -> site settings

## 10. Data Model Requirements

Core entities (phase 1):
- products
- product_categories
- product_prices (or pricing fields)
- orders
- order_items
- transactions
- entitlements
- licenses
- affiliate_accounts
- affiliate_referrals
- site_settings
- audit_logs

Relationship expectations:
- user has many orders
- order has many order_items
- order_item belongs to product
- user has many entitlements
- entitlement belongs to product and optionally order_item

Compatibility requirement:
- Existing `users` table and droplet access fields must remain functional.

## 11. API Requirements

Public APIs
- GET product list with filters/sort/pagination
- GET product detail

User APIs
- GET purchased products
- GET order history
- POST product action endpoints (policy constrained)

Admin APIs
- GET/PUT order state
- GET/PUT user account/access
- GET/PUT site settings

API standards
- Consistent success/error payload contracts.
- Validation errors are structured and user-safe.
- Server-side authorization on all protected routes.

## 12. Security and Access Control

1. Public catalog endpoints: read-only and rate-limited.
2. User endpoints:
- require valid authenticated session
- enforce ownership checks per resource
3. Admin endpoints:
- require admin role authorization
- deny-by-default policy
4. Mutating endpoints:
- enforce same-origin/CSRF controls
- strict server-side validation
5. Logging:
- do not leak secrets in responses/logs
- audit critical admin and entitlement mutations

## 13. UX and Brand Requirements

1. All new UI must follow:
- `docs/projects/frontend-brand-guidelines.md`

2. Homepage style expectations
- Product-first utility surface, not long marketing storytelling page.
- Fast scan layout with robust filtering.
- Consistent card, typography, and motion system.

3. Dashboard expectations
- Keep interaction patterns consistent with current dashboard style language.
- Clear status badges and action hierarchy.

## 14. Non-Functional Requirements

Performance
- Homepage product list p95 <= 2.0s for first meaningful data render.
- Filter/sort interaction response <= 300ms client feedback and <= 700ms API p95 target (excluding provider latency).

Reliability
- Order and entitlement writes must be idempotent where applicable.
- Admin actions should provide deterministic status transitions.

Scalability
- Catalog and order endpoints support pagination and indexing strategy.

Observability
- Track key errors, admin mutations, and order/entitlement state transitions.

## 15. Analytics and KPIs

Homepage KPIs
- product list view count
- filter usage rate
- product click-through rate
- conversion-to-order funnel start

User dashboard KPIs
- purchased product page engagement
- self-service action completion rate
- reduction in support-assisted actions

Admin KPI
- order processing lead time
- entitlement correction turnaround
- settings change failure rate

Growth/Parity KPI
- affiliate referral conversion rate
- reminder-triggered recovery rate
- license validation success/failure ratio
- checkout-to-entitlement completion latency

## 16. Rollout Plan

Phase 1: Data and API foundation
- products, orders, entitlements, settings models and APIs

Phase 2: Homepage launch
- public product catalog and filters

Phase 3: User dashboard expansion
- purchased product module and order views

Phase 4: Admin dashboard launch
- orders/users/settings with role access and audit logs

Phase 5: Hardening
- performance tuning, policy audits, analytics validation

Phase 6: Parity growth modules
- affiliate tracking baseline
- lifecycle reminder automation
- license validation API

## 17. Acceptance Criteria

1. Homepage
- Product catalog with functional filters and sorting.
- Pagination and query-param persistence works.

2. User dashboard
- Purchased product listing and details available.
- Droplet module still works without regression.

3. Admin dashboard
- Authorized admin can manage orders/users/settings.
- Unauthorized users cannot access admin routes.

4. Security
- Ownership and role checks pass for all protected resources.
- No high-severity leakage in error responses.

5. UX
- New pages comply with frontend brand guideline.

## 18. Risks and Mitigations

Risk 1: Scope creep across three large surfaces
- Mitigation: strict phased delivery and acceptance gates.

Risk 2: Entitlement logic complexity
- Mitigation: explicit state model and transition rules before implementation.

Risk 3: Admin misuse or accidental destructive updates
- Mitigation: role policy + confirmation UI + audit logs + constrained transitions.

Risk 4: Performance degradation from catalog filters
- Mitigation: indexed queries, pagination, and filter query optimization.

Risk 5: Regression in existing droplet management
- Mitigation: parity regression checklist and protected droplet route tests.

## 19. Open Questions

1. Payment provider integration path for orders (existing vs new).
2. Exact product taxonomy and pricing model.
3. Entitlement lifecycle states and renewal rules by product type.
4. Admin role hierarchy (admin vs super-admin capabilities).
5. Need for manual fulfillment workflow in phase 1.
6. License key format and revocation policy details.
7. Affiliate commission and withdrawal policy boundaries.
8. Reminder channel priority (email, WhatsApp, in-app) and escalation logic.

## 20. Implementation Notes

- This PRD defines product and engineering requirements for expansion.
- It does not replace the Laravel migration PRD; it builds on top of it.
- Existing droplet management is a non-negotiable preserved capability.
