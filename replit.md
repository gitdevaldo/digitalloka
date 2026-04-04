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
- **Security:** CSP, HSTS, Permissions-Policy headers via next.config.js; error sanitization via `src/lib/error-sanitizer.ts`; ilike injection protection in audit logs

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
    ├── validation/        # Zod schemas & parseBody helper for API input validation
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
- Wishlist: Context-based (`WishlistProvider`), stored in Supabase `wishlists` table, login dialog for unauthenticated users. Dedicated page at `/wishlist` with 2-col grid, thick border cards, remove/add-to-cart/buy-now actions, summary bar
- Cart: Context-based (`CartProvider`), stored in localStorage (`digitalloka_cart`). Dedicated page at `/cart` with 2-col layout (items + sticky order summary), quantity controls, remove buttons
- Checkout: `/checkout` page — 3-step wizard (Details/Review & Pay) with sticky order summary, creates orders via `/api/user/cart-checkout`, redirects to Mayar payment link. Success page at `/checkout/success` with green circle icon + order details card
- "Add to Cart" button on homepage product cards (`add-cart-btn` class) and product detail page (shows "Already in Cart" when in cart)
- Shared `FloatingBar` component (`src/components/layout/floating-bar.tsx`): fixed bottom bar that slides up after scrolling 200px and hides near footer (IntersectionObserver on `.catalog-footer`). Props: `alwaysVisible` (skip scroll), `mobileOnly` (hidden at ≥769px via `.mobile-only-bar`). Different content per page:
  - Homepage: Filter / Cart / Wishlist buttons (mobileOnly)
  - Product detail: Product name + price | Wishlist | Buy Now (alwaysVisible)
- Mobile (≤768px): Header shows only Login/Dashboard button; sidebar hidden; filter opens slide-up panel overlay
- Inner page CSS classes: `.inner-wrap`, `.wish-card`, `.cart-item`, `.cart-layout`, `.order-summary`, `.form-panel`, `.checkout-steps`, `.success-page`, `.success-icon-circle`, `.prod-icon`, `.spec-pill`, `.remove-btn`
- Empty state styling: `.empty-state` with `.empty-icon`, `.empty-title`, `.empty-desc` or `.icon/h3/p`
- Button disabled states: `.btn:disabled` and `.btn.btn-disabled` (opacity 0.4, no transform), `.add-cart-btn:disabled` (cursor not-allowed)

## CRITICAL: Database Connection Rules
- **ALWAYS use `DATABASE_URL` from `.env.local`** to connect to the Supabase PostgreSQL database. This is the live Supabase database.
- **NEVER use Replit's built-in Helium/local PostgreSQL database.** It is a completely separate system and has nothing to do with this project.
- **All application tables live in the `public` schema.** When querying, inspecting columns, or making changes, always target the `public` schema.
- The `DATABASE_URL` in `.env.local` points directly to the Supabase PostgreSQL instance (session mode, port 5432).

## Database (Supabase PostgreSQL)
Tables: `users`, `products`, `product_categories`, `product_types`, `product_stock_items`, `orders`, `order_items`, `transactions`, `payment_events`, `entitlements`, `site_settings`, `audit_logs`, `wishlists`, `rate_limit_entries`, `cache_entries`

Pricing is stored directly on the `products` table (`price_amount`, `price_currency`, `price_billing_period`) — no separate pricing table.

Key design decisions:
- **Product types** are stored in `product_types` table (type_key, label, description, is_active, fields JSONB). Legacy copy also in `site_settings`
- **Droplets** are NOT stored in DB; they come from DigitalOcean API. Users have `droplet_ids` JSONB column
- **Product stocks** use `product_stock_items` table with `credential_data` JSONB and `credential_hash` for dedup
- **All JSON columns use JSONB** (migrated from json→jsonb in migration 003)
- **updated_at triggers** bound to all tables with `updated_at` via `update_updated_at_column()` function
- **created_at/updated_at defaults** all set to `DEFAULT now()`

### Security Hardening (docs/sql/2026-04-04-security-hardening.sql)
Run against Supabase to apply critical RLS fixes:
- `wishlists` — RLS enabled with user-scoped read/write policies + admin read
- `orders` — Update policy tightened so users cannot modify status, payment_status, total_amount, subtotal_amount
- `product_stock_items` — RLS enabled, public read removed, admin-only + sold-item owner read
- `products` — Legacy unconditional public read policy dropped (main policy already filters by is_visible + status)

### Database Indexes (docs/sql/2026-04-03-database-indexes.sql)
Run against Supabase to apply performance indexes:
- `order_items(order_id)`, `transactions(order_id)` — RLS policy join acceleration
- `payment_events(idempotency_key)` UNIQUE — idempotent payment processing
- `products(is_visible, status, category_slug)` — catalog filter queries
- `products(slug)` — slug lookups
- `products(name)`, `products(short_description)` — GIN trigram indexes for ILIKE search (requires pg_trgm)
- `entitlements(order_item_id, user_id)` — entitlement existence checks
- `product_stock_items(product_id, credential_hash)` — already covered by existing unique index from initial migration

## Payment Gateway: Mayar (Sandbox)
- **Provider:** Mayar (Indonesian payment gateway) — sandbox at `mayar.club`
- **Base URL:** `https://api.mayar.club/hl/v1` (configured in `.env.local` as `MAYAR_BASE_URL`)
- **API client:** `src/lib/services/mayar.ts` — `createInvoice()` and `createPayment()`
- **Checkout flow:** Order created (pending) → Mayar invoice created with `extraData` (order_id, order_number, user_id) → user redirected to Mayar payment link → Mayar sends webhook on payment → order marked paid
- **Webhook:** `POST /api/payments/mayar/webhook` — handles `payment.received` events, uses `process_payment_atomic` RPC for idempotent payment processing
- **Success page:** `/checkout/success?order=<order_number>` — where Mayar redirects users after payment (configured via `redirectUrl` in invoice)
- **Middleware:** Mayar webhook route is NOT behind auth middleware (must be publicly accessible for Mayar callbacks)
- **Checkout UI:** Simplified 3-step wizard (Cart → Details → Review & Pay). Payment method selection removed — Mayar handles all payment options (bank transfer, QRIS, e-wallet, etc.)

## Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DIGITALOCEAN_TOKEN` - DigitalOcean API token
- `DATABASE_URL` - Direct PostgreSQL connection string (for migrations)
- `MAYAR_API_KEY` - Mayar API key (in Replit secrets)
- `MAYAR_WEBHOOK_TOKEN` - Mayar webhook verification token (in Replit secrets, separate from API key)
- `MAYAR_BASE_URL` - Mayar API base URL (in `.env.local`)
- `PAYMENT_WEBHOOK_SECRET` - HMAC secret for verifying payment webhook signatures
- `MAYAR_SANDBOX` - Set to "true" for sandbox mode (in `.env.local`)
- `RATE_LIMIT_STORE` - `memory` (default) or `database` for Supabase-backed rate limiting
- `CACHE_STORE` - `memory` (default) or `database` for Supabase-backed API cache

## Key Features
1. **Catalog/Marketplace** - Public product browsing with search, sort, filtering
2. **Magic Link Auth** - Passwordless login for users and admin (PKCE flow)
3. **Dashboard** - Live data stats (products/droplets/orders/entitlements), droplet management (power on/off/reboot), product entitlements with revoke, order history, digital downloads via API action, license keys, account edit modal, support ticket modal
4. **Admin Panel** - Product CRUD with dedicated create/edit pages (full-page forms), product types with schema builder (dedicated pages), product stocks with per-item Edit/Delete actions, user management (role/block modals), order fulfillment (status transition modal), entitlement lifecycle (inline Activate/Pending/Revoke/+30d buttons), droplet admin (power action modal), site settings (4 config panels with API load/save and data-setting-key attributes), audit logs with CSV export and payload viewer, overview with live API-fetched stats. ID formatting: PRD-001 (products), ENT-001 (entitlements), ORD-0001 (orders), EVT-0001 (audit). Account edit modal, support ticket modal
5. **Commerce** - Atomic checkout flow (via PostgreSQL RPC functions), payment webhooks with idempotency + atomic processing, collision-resistant order numbers (crypto.randomUUID), shared entitlement provisioning logic
6. **Route Protection** - Middleware guards `/dashboard/*`, `/admin/*`, and all API routes (`/api/admin/*`, `/api/user/*`, `/api/auth/*`, `/api/payments/*`); admin role check via Supabase at middleware level for both page and API routes
7. **Rate Limiting** - Sliding window rate limiter (`src/lib/rate-limit.ts`) applied at middleware level: auth login (5/min/IP), webhooks (30/min/IP), checkout (10/min/IP). Returns 429 with Retry-After header. Supports in-memory (default) or Supabase-backed persistent store via `RATE_LIMIT_STORE=database` env var. DigitalOcean API cache similarly supports `CACHE_STORE=database` for persistence across serverless instances.

## Cursor-Based Pagination
Large tables (audit logs, orders, transactions) support cursor-based pagination using `created_at` + `id` as the composite cursor. The cursor utility is in `src/lib/cursor-pagination.ts` with `encodeCursor`, `decodeCursor`, and `applyCursorPagination` helpers.

API endpoints accept `cursor` (base64url-encoded), `per_page`, and `mode=cursor|offset` query params. Default mode is `cursor`. Responses include `next_cursor` and `has_more` fields. Offset-based pagination still works by passing `mode=offset` with `page` param.

Admin and user dashboard pages use cursor-based "Load More" pattern for audit logs and orders.

## CRITICAL: Git & Replit Rules — READ THIS BEFORE ANY GIT OPERATION
- **Replit only has a SHALLOW copy of the git history.** It does NOT have the full commit history from GitHub. The local repo may only have the most recent commits (e.g. 14 out of 188).
- **NEVER run `git filter-branch`, `git rebase`, or any history-rewriting command on Replit.** The local repo only has recent commits, so rewriting + force-pushing will DESTROY the full history on GitHub. This already happened once and nearly wiped 188 commits.
- **NEVER run `git push --force` from Replit.** Force-push from a shallow repo replaces the full GitHub history with only the shallow local commits. This is catastrophic and irreversible without GitHub reflog recovery.
- **NEVER suggest or run `git rebase -i` to drop commits on Replit.** Dropping commits via interactive rebase also removes the file changes from the working directory, destroying code that was in those commits. This already happened and wiped all Mayar integration files from disk.
- **To remove secrets from git history:** The user MUST do this from a full local clone on their own machine. Never attempt it from Replit. Tell the user to clone, clean, and force-push from their machine.
- **To push new commits from Replit:** Use ONLY regular `git push`. If it fails with "non-fast-forward", use `git pull origin main --rebase` first, then `git push`. Never force-push.
- **Checkpoints are precious.** Replit checkpoints capture all file changes. Do not run any git command that could cause checkpoint data to be lost. If unsure whether a command is safe, DO NOT RUN IT.

### Incident Log (2026-04-04)
1. `git filter-branch` was run on Replit to remove `env.local` from history. Replit only had 14 local commits. Force-push replaced GitHub's full 188-commit history with just 14 commits.
2. Recovered using GitHub's dangling commit SHA (`426ffeab4ed3bf9cd69b32c40475ee1f977652eb`).
3. Then `git rebase -i` was used to drop the env.local commits, which also wiped the Mayar integration files and all pre-Mayar checkpoint changes from disk.
4. Files were recovered from git reflog (`36c6df1`) but the individual pre-Mayar checkpoint commits (RLS fix, documentation updates, etc.) were lost as separate commits — their changes were squashed into a single new checkpoint.
5. Lesson: NEVER do git history rewriting on Replit. Always tell the user to do it from a full local clone.

## Legacy Archives
- `.archive/legacy-laravel/` - Previous Laravel implementation (source of truth for UI parity)
- `.archive/legacy/` - Original Next.js implementation
