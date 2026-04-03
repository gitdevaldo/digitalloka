# DigitalLoka - DigitalOcean Panel & Digital Product Marketplace

## Overview
Next.js 15 App Router application with Neo-Brutalist UI design, featuring DigitalOcean droplet management, a digital product marketplace, commerce/checkout system, and admin panel.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4 with Neo-Brutalist design tokens
- **Database/Auth:** Supabase (magic link auth via `@supabase/ssr`)
- **External API:** DigitalOcean API v2 (droplet management)
- **Fonts:** Outfit (headings) + Plus Jakarta Sans (body)
- **Icons:** Lucide React
- **Port:** 5000

## Architecture
```
src/
├── app/
│   ├── (public)/          # Catalog pages (marketplace, product detail)
│   ├── login/             # User magic link login
│   ├── admin/login/       # Admin magic link login (bypasses admin layout)
│   ├── auth/callback/     # OAuth/magic link callback handler
│   ├── dashboard/         # User dashboard
│   │   ├── page.tsx       # Overview (greeting, 4 stat cards, VPS health, recent orders, expiring entitlements)
│   │   ├── products/      # All Products (table with filters)
│   │   │   ├── digital/   # Digital Products (downloads table)
│   │   │   └── access/    # Product Access (license keys table)
│   │   ├── droplets/      # VPS Droplets (card grid with power actions)
│   │   ├── orders/        # Order History (table with status filters)
│   │   ├── account/       # Account (2-col profile + billing panels)
│   │   └── support/       # Support (3-col help cards + tickets)
│   ├── admin/(dashboard)/ # Admin panel with sidebar
│   │   ├── page.tsx       # Overview (8 stat cards, audit events, priority queues)
│   │   ├── products/      # Products (table with type/status filters, create/edit)
│   │   ├── product-types/ # Product Types (schema table + type editor)
│   │   ├── product-stocks/# Product Stocks (inventory management per product)
│   │   ├── orders/        # Orders (table with fulfillment/payment filters)
│   │   ├── users/         # Users (table with role/status filters)
│   │   ├── entitlements/  # Entitlements (license lifecycle table)
│   │   ├── droplets/      # Droplets (server admin table with region filters)
│   │   ├── audit-logs/    # Audit Logs (event history with actor/action/result/date filters)
│   │   ├── settings/      # Settings (4 panels: Catalog, Entitlement, Order, Contacts)
│   │   ├── account/       # Admin Account (profile + sessions table)
│   │   └── support/       # Support (3-col cards + tickets)
│   └── api/               # Route handlers
│       ├── auth/          # login, session, logout
│       ├── products/      # Public catalog API
│       ├── droplets/      # DigitalOcean droplet management
│       ├── user/          # User-scoped products, orders, checkout
│       ├── admin/         # Admin CRUD (products, users, orders, settings, audit-logs, entitlements, product-types, product-stocks, droplets)
│       └── payments/      # Webhook processing
├── components/
│   ├── ui/                # Button, ButtonLink, StatusBadge, Panel, Modal, Toast, EmptyState, AdminTable, TableShell, AvatarChip
│   └── layout/            # DashboardShell, Topbar, Sidebar, PageHeader, BrandLogo
└── lib/
    ├── supabase/          # Server, browser, middleware clients
    ├── services/          # Business logic (auth, DO, catalog, orders, payments, audit, settings)
    └── utils.ts           # cn(), formatCurrency(), formatDate()
```

## Sidebar Navigation
### Dashboard Sidebar
- Overview, Products (expandable: All Products, VPS Droplets, Digital Products, Product Access), Orders (with dot badge), bottom: Account, Support, Logout

### Admin Sidebar
- Overview, Products, Product Types (indented), Product Stocks (indented), Orders (with count badge), Users, Entitlements (with dot), Droplets, Audit Logs, Settings, bottom: Admin Account, Support, Logout

## Design System (Neo-Brutalist)
- Background: `#FFFDF5` (warm cream) with dot grid pattern (24px spacing)
- Borders: `border-2 border-foreground` everywhere
- Shadows: `shadow-pop` (4px 4px 0), hover state pushes to 6-7px
- Catalog cards: `rounded-[32px]` (--radius-xl), hover translate(-3px,-3px) with 7px shadow
- Dashboard cards: `rounded-[var(--radius-xl)]` (32px)
- Admin cards: `rounded-[var(--r-xl)]` (20px), `rounded-[14px]` for panels
- Colors: Purple (accent #8B5CF6), Pink (secondary #F472B6), Amber (tertiary #FBBF24), Green (quaternary #34D399)
- Brand logo: Purple bg box with white "Digital" + amber "Loka"
- Catalog layout: Fixed topbar + left sidebar (240px / --sidebar-w) with filter chips + main content with hero strip
- Shared Topbar component: All areas (catalog, dashboard, admin) use same `Topbar` component with variant prop
- Wishlist: Context-based (`WishlistProvider`), stored in Supabase `wishlists` table, login dialog for unauthenticated users
- Shared `FloatingBar` component (`src/components/layout/floating-bar.tsx`): fixed bottom bar that slides up after scrolling 200px and hides near footer (IntersectionObserver on `.catalog-footer`). Different content per page:
  - Homepage: Filter / Cart / Wishlist buttons
  - Product detail: Product name + price | Wishlist | Buy Now
- Mobile (≤768px): Header shows only Login/Dashboard button; sidebar hidden; filter opens slide-up panel overlay

## Database (Supabase PostgreSQL)
Tables: `users`, `products`, `product_categories`, `product_types`, `product_stock_items`, `orders`, `order_items`, `transactions`, `payment_events`, `entitlements`, `site_settings`, `audit_logs`, `wishlists`

Pricing is stored directly on the `products` table (`price_amount`, `price_currency`, `price_billing_period`) — no separate pricing table.

Key design decisions:
- **Product types** are stored in `product_types` table (type_key, label, description, is_active, fields JSONB). Legacy copy also in `site_settings`
- **Droplets** are NOT stored in DB; they come from DigitalOcean API. Users have `droplet_ids` JSON column
- **Product stocks** use `product_stock_items` table with `credential_data` JSON and `credential_hash` for dedup

## Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DIGITALOCEAN_TOKEN` - DigitalOcean API token
- `DATABASE_URL` - Direct PostgreSQL connection string (for migrations)

## Key Features
1. **Catalog/Marketplace** - Public product browsing with search, sort, filtering
2. **Magic Link Auth** - Passwordless login for users and admin (PKCE flow)
3. **Dashboard** - Live data stats (products/droplets/orders/entitlements), droplet management (power on/off/reboot), product entitlements with revoke, order history, digital downloads via API action, license keys, account edit modal, support ticket modal
4. **Admin Panel** - Product CRUD with dedicated create/edit pages (full-page forms), product types with schema builder (dedicated pages), product stocks with per-item Edit/Delete actions, user management (role/block modals), order fulfillment (status transition modal), entitlement lifecycle (inline Activate/Pending/Revoke/+30d buttons), droplet admin (power action modal), site settings (4 config panels with API load/save and data-setting-key attributes), audit logs with CSV export and payload viewer, overview with live API-fetched stats. ID formatting: PRD-001 (products), ENT-001 (entitlements), ORD-0001 (orders), EVT-0001 (audit). Account edit modal, support ticket modal
5. **Commerce** - Checkout flow, payment webhooks with idempotency, entitlement provisioning
6. **Route Protection** - Middleware guards `/dashboard/*` and `/admin/*` routes; admin role check via Supabase

## Legacy Archives
- `.archive/legacy-laravel/` - Previous Laravel implementation (source of truth for UI parity)
- `.archive/legacy/` - Original Next.js implementation
