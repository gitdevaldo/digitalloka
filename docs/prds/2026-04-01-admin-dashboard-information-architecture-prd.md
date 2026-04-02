# Admin Dashboard Information Architecture PRD

## Status
- Completed

## Date
- 2026-04-01

## Objective
Define the complete admin dashboard structure and module requirements with all features available now. The admin panel must provide full operational control for products, orders, users, entitlements, settings, droplets, and audit monitoring.

## Scope Rule
- No optional modules in this PRD.
- Every navigation item and module below is required and must be available now.
- Any missing route or module must be implemented immediately, not deferred.

## Navigation Structure
- Overview
- Products
- Orders
- Users
- Entitlements
- Droplets
- Audit Logs
- Settings

### Bottom Sticky Navigation
- Admin Account
- Support

### Navigation Behavior Requirements
- Admin Account and Support must be pinned at the bottom of the sidebar navigation.
- Main navigation list must remain scrollable independently from bottom sticky navigation.
- Active item state must persist across full page reloads and direct URL access.

## Route Requirements (Available Now)
- /admin
- /admin/products
- /admin/orders
- /admin/users
- /admin/entitlements
- /admin/droplets
- /admin/audit-logs
- /admin/settings

## Dashboard Page Requirements

### 1. Overview
- Show total products.
- Show active products.
- Show total users.
- Show total orders.
- Show pending orders.
- Show active entitlements.
- Show total managed droplets.
- Show droplet actions in progress.
- Show recent critical audit events.
- Show quick links to high-priority queues.

### 2. Products
- Full product list with create and update workflows.
- Required list fields:
  - Product name
  - Product type
  - Category
  - Visibility status
  - Inventory or availability status
  - Active pricing summary
  - Updated timestamp
- Required actions:
  - Create product
  - Edit product
  - Toggle visibility
  - Manage pricing
  - Manage product tags and badges

### 3. Orders
- Full order management list and detail.
- Required list fields:
  - Order id
  - User reference
  - Item count
  - Total amount
  - Payment status
  - Fulfillment status
  - Created timestamp
- Required actions:
  - Update order status
  - View line items and linked products
  - View linked transactions

### 4. Users
- Full user list and user detail.
- Required list fields:
  - User id
  - Email
  - Role
  - Account status
  - Product ownership count
  - Last activity timestamp
- Required actions:
  - Update user access status
  - View assigned products and entitlements
  - View user order history

### 5. Entitlements
- Full entitlement list and status management.
- Required list fields:
  - Entitlement id
  - User
  - Product
  - Source order
  - Entitlement status
  - Start date
  - Expiry date
- Required actions:
  - Activate entitlement
  - Suspend entitlement
  - Revoke entitlement
  - Extend entitlement duration

### 6. Droplets
- Full droplet administration list and detail.
- Required list fields:
  - Droplet id
  - User owner
  - Linked product entitlement
  - Region
  - Plan or size
  - Runtime status
  - Public IP
  - Last action timestamp
- Required actions:
  - Power on
  - Power off
  - Reboot
  - Refresh status
  - View action log
- Required enforcement:
  - Every droplet operation must be tied to user entitlement context.
  - Every mutating action must pass same-origin and auth checks.

### 7. Audit Logs
- Full event log view for admin actions and critical system events.
- Required list fields:
  - Event id
  - Actor
  - Action
  - Target type
  - Target id
  - Result
  - Timestamp
- Required capabilities:
  - Filter by actor, action, target type, result, date range
  - Search by target id or actor identifier
  - Open event detail payload for investigation

### 8. Settings
- Full settings management page.
- Required settings groups:
  - Catalog settings
  - Order and fulfillment settings
  - Entitlement defaults
  - Operational contact settings
- Required actions:
  - View current value
  - Update value
  - Persist with audit logging

## Data Contract Requirements

### Required admin product fields
- id
- name
- slug
- product_type
- category_id
- status
- is_visible
- rating
- reviews_count
- tags
- badges

### Required admin order fields
- id
- user_id
- status
- total_amount
- currency
- payment_status
- created_at

### Required admin user fields
- id
- email
- role
- status
- droplet_ids

### Required admin entitlement fields
- id
- user_id
- product_id
- order_id
- status
- starts_at
- expires_at

### Required admin droplet fields
- droplet_id
- user_id
- entitlement_id
- region
- plan
- ip_address
- runtime_status
- last_action_at

### Required audit fields
- id
- actor_id
- action
- target_type
- target_id
- payload
- result
- created_at

## Security and Permission Requirements
- Admin pages must require authenticated admin session.
- Non-admin users must be blocked from all admin routes.
- Every state-changing request must pass same-origin checks.
- Droplet operations must validate ownership and entitlement linkage before execution.
- Secrets and provider tokens must never be exposed in admin UI responses.

## UX State Requirements
- Each module must include loading, empty, success, and error states.
- All mutating actions must show in-progress state and completion feedback.
- Error messages must map to typed backend errors and include retry path.
- Tables must support pagination for production-scale records.

## Acceptance Criteria
- All admin navigation items listed in this PRD are available now.
- Admin Account and Support are pinned in bottom sticky navigation.
- /admin/entitlements, /admin/droplets, and /admin/audit-logs are available now.
- Admin can fully manage products, orders, users, entitlements, droplets, and settings.
- Audit log is available now and captures admin state-changing events.
- Access control blocks non-admin access on all admin routes.
