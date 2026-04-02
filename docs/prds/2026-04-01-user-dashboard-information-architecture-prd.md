# User Dashboard Information Architecture PRD

## Status
- Completed

## Date
- 2026-04-01

## Objective
Define a clear user dashboard structure where droplets are treated as owned products. If a user buys or is assigned a VPS droplet product, it appears under Products and is managed from that product context.

## Core Rule
- Droplets are not a top-level navigation item.
- Droplets are a product subtype under Products.
- If user owns a VPS droplet product, it appears in Products and exposes droplet management actions in a submenu.

## Navigation Structure
- Overview
- Products
- Orders
- Optional: Account
- Optional: Support

### Products Submenu
- All Products
- VPS Droplets
- Digital Products
- Product Access

## Product Model Requirements
- Every user-owned item is represented as a product entitlement.
- VPS droplet ownership is modeled as a product entitlement with type `vps_droplet`.
- Each `vps_droplet` product can map to one or more droplet resources.
- Droplet lifecycle actions are available only through the VPS product detail flow.

## Dashboard Page Requirements

### 1. Overview
- Show total owned products.
- Show total VPS droplet products.
- Show quick health summary for VPS droplets (running, stopped, action required).
- Show recent orders.
- Show expiring/blocked entitlements.

### 2. Products (Parent)
- Unified product list (all user-owned products).
- Filters:
  - Product type
  - Entitlement status
  - Search by product name
- Product cards/rows must show:
  - Product name
  - Product type
  - Access status
  - Purchase/assignment date
  - Linked resources count (for VPS products)

### 3. Products > VPS Droplets (Submenu)
- List only VPS droplet products and linked droplets.
- Show:
  - Product name
  - Droplet name
  - Region
  - Plan/size
  - Public IP
  - Runtime status
  - Last action timestamp
- Actions per droplet:
  - Power on
  - Power off
  - Reboot
  - Refresh status
- Action rules:
  - Disable action while request is in progress
  - Show success/failure feedback
  - Keep ownership and permission checks enforced server-side

### 4. Orders
- Show order history and order detail.
- Link order line item to related product.
- If line item is VPS droplet product, user can open Products > VPS Droplets from that line item.

## Route and IA Requirements
- Keep existing top-level user routes for now:
  - /dashboard
  - /dashboard/products
  - /dashboard/orders
- Add submenu UX under Products for VPS droplets.
- Optional future route split if needed:
  - /dashboard/products/droplets
- If split route is added, it must keep Products as parent nav and Droplets as child/submenu nav.

## Data Contract Requirements

### Required product fields
- id
- name
- product_type
- status
- entitlement_status
- purchased_at or assigned_at

### Required VPS mapping fields
- product_id
- droplet_id
- droplet_name
- region
- plan
- ip_address
- runtime_status
- last_action_at

## Permissions and Security Requirements
- User only sees products they own.
- Droplet actions are allowed only for droplets linked to user-owned VPS product entitlements.
- No admin operations are visible in user dashboard.
- Mutating calls require same-origin protection and authenticated session.

## UX State Requirements
- Loading, empty, and error states for each Products submenu view.
- Clear empty state when user has no VPS droplet products.
- Inline action feedback for droplet actions.
- Retry option for failed status refresh or action calls.

## Acceptance Criteria
- Dashboard nav does not show Droplets as top-level item.
- Products exists as top-level item with submenu.
- VPS droplet resources are visible under Products > VPS Droplets.
- User can manage droplet actions from VPS product context.
- Orders link users back to product context, including VPS droplet products.
- Ownership checks block access to unassigned droplet resources.
