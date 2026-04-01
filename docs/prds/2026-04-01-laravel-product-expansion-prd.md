# PRD: DigitalLoka Product Expansion on Laravel

Date: 2026-04-01
Status: Completed
Owner: Product + Engineering
Stakeholders: Product, Engineering, Operations, Sales, Support

## 1. Executive Summary

DigitalLoka has completed initial migration direction to Laravel for core droplet operations. This PRD defines the next product expansion to add:

1. Public homepage focused on product listing with filter/sort.
2. User dashboard expansion to manage purchased products and orders in addition to droplets.
3. Admin dashboard to manage site settings, products, users, orders, and operational controls.

Primary goal:
- Evolve DigitalLoka from droplet-only operations into a broader digital product platform while keeping droplet management fully operational.

## 2. Problem Statement

Current limitations:
- Public surface lacks a product-focused discovery experience.
- User dashboard is primarily droplet-centric and does not provide complete purchase/order management.
- Admin operations are fragmented and lack a dedicated control center for products, users, and site settings.

Business impact:
- Lower discoverability for product offerings.
- Increased support burden for order/access questions.
- Slower operational response due to missing admin tooling.

## 3. Objectives

1. Launch a product-first homepage with filters and sorting.
2. Expand user dashboard to include products, orders, and access visibility.
3. Launch admin dashboard for core site and commerce operations.
4. Preserve all existing droplet security and ownership behavior.

Success outcomes:
- Increased product discovery engagement.
- Improved user self-service completion for product/order tasks.
- Reduced admin processing time for common operational actions.

## 4. Scope

### In Scope (Phase 1)
- Homepage product listing, filtering, sorting, and product detail entry point.
- User dashboard modules for purchased products and order history.
- Admin dashboard modules for products, users, orders, and site settings.
- Core data model and APIs needed for product/order/access management.
- Role-based access for admin capabilities.

### Out of Scope (Phase 1)
- Full CMS and long-form marketing content management.
- Native mobile apps.
- Complex promotion engine and campaign orchestration.
- Advanced payout automation workflows.

## 5. Personas

1. Visitor
- Wants to browse products quickly and understand availability and pricing.

2. Customer/User
- Wants to manage purchases, review order status, and access product entitlements.
- Still needs droplet management in same account area.

3. Admin/Operator
- Needs centralized tools to manage products, users, orders, and site configuration.

## 6. User Stories

### Homepage
- As a visitor, I can view a list of products with key info.
- As a visitor, I can filter products by category/type/availability/price range.
- As a visitor, I can sort products by recommended/newest/price.
- As a visitor, I can open a product detail page from listing.

### User Dashboard
- As a user, I can view purchased products and entitlement status.
- As a user, I can view order history and order details.
- As a user, I can still access and manage droplets.

### Admin Dashboard
- As an admin, I can manage product data and visibility.
- As an admin, I can inspect/update user access and account status.
- As an admin, I can monitor and update order statuses.
- As an admin, I can manage site settings with audit visibility.

## 7. Functional Requirements

### 7.1 Homepage

FR-H1 Product Listing
- Render paginated product cards with:
  - name
  - short description
  - category
  - price summary
  - availability status
  - primary CTA

FR-H2 Filtering and Sorting
- Supported filters:
  - category
  - product type
  - availability
  - min/max price
- Supported sort:
  - recommended
  - newest
  - price ascending
  - price descending

FR-H3 URL State
- Filter/sort/page state reflected in query params.

FR-H4 Product Detail Entry
- Product card click opens product detail route.

### 7.2 User Dashboard

FR-U1 Navigation
- Dashboard includes sections for:
  - droplets
  - products
  - orders
  - account/profile

FR-U2 Purchased Products
- Display purchased products with entitlement/access status.

FR-U3 Orders
- Display order list with status and detail route.

FR-U4 Action Feedback
- User actions return clear success/error responses.

FR-U5 Droplet Continuity
- Existing droplet operations remain intact.

### 7.3 Admin Dashboard

FR-A1 Admin Authorization
- Admin routes restricted by role policy.

FR-A2 Product Management
- Create/read/update product metadata and visibility.
- Manage product category and pricing entries.

FR-A3 User Management
- View users and account state.
- Update role and active status.

FR-A4 Order Management
- List/filter/search orders.
- Update status using controlled transitions.

FR-A5 Site Settings
- Manage grouped site settings.
- Settings updates are auditable.

FR-A6 Audit Trail
- Critical admin mutations log actor/action/target/timestamp.

## 8. Information Architecture

Public:
- /
- /products/{slug}

User:
- /dashboard
- /dashboard/droplets
- /dashboard/products
- /dashboard/orders

Admin:
- /admin
- /admin/products
- /admin/users
- /admin/orders
- /admin/settings

## 9. Data Model Requirements

Core entities:
- products
- product_categories
- product_prices
- orders
- order_items
- transactions
- entitlements
- site_settings
- audit_logs

Compatibility requirement:
- Existing users and droplet assignment model must remain functional.

## 10. API Requirements

Public APIs:
- GET /api/products
- GET /api/products/{slug}

User APIs:
- GET /api/user/products
- GET /api/user/orders
- GET /api/user/orders/{id}
- POST /api/user/products/{id}/actions

Admin APIs:
- GET/PUT /api/admin/products
- GET/PUT /api/admin/users
- GET/PUT /api/admin/orders
- GET/PUT /api/admin/settings

API standards:
- Structured success/error payloads.
- Explicit validation errors.
- No sensitive secret leakage.

## 11. Security and Access Control

1. Public routes are read-only and rate-limited.
2. User routes require validated session.
3. Resource ownership checks enforced for user data access.
4. Admin routes require admin authorization.
5. Mutating endpoints enforce same-origin/CSRF controls.
6. Validation required on all write operations.
7. Critical actions recorded in audit logs.

## 12. Non-Functional Requirements

Performance:
- Homepage listing p95 <= 2.0s for initial meaningful response.
- Filter/sort API p95 <= 700ms (excluding external provider variance).

Reliability:
- Order and access state transitions are deterministic.
- Idempotency handling for critical write paths.

Scalability:
- Pagination and indexing for list-heavy routes.

Observability:
- Logs and metrics for auth failures, order transitions, admin actions, and entitlement updates.

## 13. Analytics and KPIs

Homepage KPIs:
- product listing views
- filter usage rate
- product click-through rate

User KPIs:
- purchased product engagement
- order self-service completion

Admin KPIs:
- order processing lead time
- user/account update turnaround
- settings update error rate

## 14. Rollout Plan

Phase 1: Data model and API foundation
- Implement schema, services, and secured APIs.

Phase 2: Homepage
- Launch product list/filter/sort/detail entry.

Phase 3: User dashboard expansion
- Launch products/orders modules with droplet continuity.

Phase 4: Admin dashboard
- Launch products/users/orders/settings modules.

Phase 5: Hardening
- Security validation, performance tuning, monitoring baseline.

## 15. Acceptance Criteria

1. Homepage
- Product listing, filters, sorting, and query-state behavior work as defined.

2. User dashboard
- Users can access product and order modules.
- Droplet module behavior remains operational.

3. Admin dashboard
- Authorized admins can manage products/users/orders/settings.
- Unauthorized access is blocked.

4. Security
- Ownership, admin role checks, and same-origin checks are enforced on relevant endpoints.

5. Stability
- No high-severity regressions in existing droplet workflows.

## 16. Risks and Mitigations

Risk 1: Scope expansion across three major surfaces.
- Mitigation: strict phased delivery and gate criteria.

Risk 2: Access/entitlement complexity.
- Mitigation: explicit status transition model and tests.

Risk 3: Admin misuse of powerful operations.
- Mitigation: constrained transitions, confirmations, and audit logging.

Risk 4: Performance degradation on list/filter routes.
- Mitigation: indexed queries, pagination defaults, bounded filters.

Risk 5: Regression to droplet workflows.
- Mitigation: dedicated droplet regression checklist before each release.

## 17. Open Decisions

1. Product taxonomy depth for phase 1.
2. Initial pricing model (single vs tiered package granularity).
3. Admin role hierarchy details (admin vs super-admin capabilities).
4. Payment integration strategy for order lifecycle.
5. Notification strategy for order/access updates.

## 18. Implementation Note

This PRD is a product-expansion document that extends the Laravel migration baseline. It does not replace migration requirements already defined in docs/prds/2026-04-01-laravel-migration-prd.md.
