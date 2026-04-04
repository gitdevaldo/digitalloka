# DigitalLoka - DigitalOcean Panel & Digital Product Marketplace

## Overview
DigitalLoka is a Next.js application designed to provide a comprehensive platform for managing DigitalOcean droplets and serving as a digital product marketplace. It features a Neo-Brutalist UI and integrates a full commerce/checkout system along with an administrative panel for product and user management. The project aims to offer a robust and visually distinct solution for digital product sales and cloud resource management.

## User Preferences
- **CRITICAL: Database Connection Rules**:
  - ALWAYS use `DATABASE_URL` from `.env.local` to connect to the Supabase PostgreSQL database. This is the live Supabase database.
  - NEVER use Replit's built-in Helium/local PostgreSQL database. It is a completely separate system and has nothing to do with this project.
  - All application tables live in the `public` schema. When querying, inspecting columns, or making changes, always target the `public` schema.
  - The `DATABASE_URL` in `.env.local` points directly to the Supabase PostgreSQL instance (session mode, port 5432).
- **CRITICAL: Git & Replit Rules — READ THIS BEFORE ANY GIT OPERATION**:
  - Replit only has a SHALLOW copy of the git history. It does NOT have the full commit history from GitHub. The local repo may only have the most recent commits (e.g. 14 out of 188).
  - NEVER run `git filter-branch`, `git rebase`, or any history-rewriting command on Replit. The local repo only has recent commits, so rewriting + force-pushing will DESTROY the full history on GitHub. This already happened once and nearly wiped 188 commits.
  - NEVER run `git push --force` from Replit. Force-push from a shallow repo replaces the full GitHub history with only the shallow local commits. This is catastrophic and irreversible without GitHub reflog recovery.
  - NEVER suggest or run `git rebase -i` to drop commits on Replit. Dropping commits via interactive rebase also removes the file changes from the working directory, destroying code that was in those commits. This already happened and wiped all Mayar integration files from disk.
  - To remove secrets from git history: The user MUST do this from a full local clone on their own machine. Never attempt it from Replit. Tell the user to clone, clean, and force-push from their machine.
  - To push new commits from Replit: Use ONLY regular `git push`. If it fails with "non-fast-forward", use `git pull origin main --rebase` first, then `git push`. Never force-push.
  - Checkpoints are precious. Replit checkpoints capture all file changes. Do not run any git command that could cause checkpoint data to be lost. If unsure whether a command is safe, DO NOT RUN IT.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4 with Neo-Brutalist design tokens
- **Database/Auth:** Supabase (magic link auth via `@supabase/ssr`)
- **External API:** DigitalOcean API v2 (droplet management, typed interfaces in `src/lib/services/digitalocean.ts`)
- **Fonts:** Outfit (headings) + Plus Jakarta Sans (body)
- **Icons:** Lucide React
- **Port:** 5000
- **Security:** CSP, HSTS, Permissions-Policy headers via next.config.js; error sanitization via `src/lib/error-sanitizer.ts`; ilike injection protection in audit logs
- **Error Handling:** Centralized `withErrorHandler` wrapper (`src/lib/api-handler.ts`) on all API routes; shared response helpers (`src/lib/api-response.ts`: `apiSuccess`, `apiError`, `apiJson`); audit logging on all admin write operations via `logAudit`

## System Architecture
The application is built with Next.js 14 (App Router) using TypeScript and styled with Tailwind CSS 3.4, adhering to a Neo-Brutalist design system. Supabase handles database operations and magic link authentication.

**Key Features:**
- **Catalog/Marketplace:** Public browsing with search, sort, and filter functionality.
- **Magic Link Authentication:** Passwordless login for users and administrators using a PKCE flow.
- **User Dashboard:** Provides an overview of stats, DigitalOcean droplet management (power actions), product entitlements, order history, and account settings.
- **Admin Panel:** Comprehensive CRUD operations for products, product types (with schema builder), stock items, users (with role/block management), orders (fulfillment), entitlements, DigitalOcean droplets, and site settings. Includes an audit log with CSV export and live statistics.
- **Commerce System:** Features an atomic checkout flow, idempotent payment webhook processing, collision-resistant order numbers, and shared entitlement provisioning logic.
- **Route Protection:** Middleware secures dashboard, admin, and API routes, with admin role checks implemented at the middleware level.
- **Rate Limiting:** A sliding window rate limiter protects authentication, webhooks, and checkout endpoints, supporting in-memory or Supabase-backed storage.
- **Post-Payment Fulfillment:** Automates provisioning for VPS droplets (via DigitalOcean API) and digital products (assigning stock items).
- **VPS Size Synchronization:** Admin functionality to sync DigitalOcean sizes as stock items.
- **Email Notifications:** Neo-Brutalist styled HTML email confirmations are sent after fulfillment, queued asynchronously.

**UI/UX Design:**
The Neo-Brutalist design system is characterized by:
- Warm cream background (`#FFFDF5`) with a dot grid pattern.
- Prominent `border-2 border-foreground` for all elements.
- `shadow-pop` (4px 4px 0) for depth, with hover states pushing shadows further.
- Rounded corners: `rounded-[32px]` for catalog cards, `rounded-[var(--radius-xl)]` (32px) for dashboard cards, and `rounded-[14px]` to `rounded-[var(--r-xl)]` (20px) for admin panels.
- Distinct color palette: Purple (accent), Pink (secondary), Amber (tertiary), Green (quaternary).
- A shared `Topbar` component across all sections and a `FloatingBar` component for context-sensitive actions, adapting for mobile views.
- Dedicated pages for Wishlist, Cart, and a 3-step checkout wizard.
- Mobile Responsiveness: Adaptive layouts for smaller screens, including hidden sidebars and slide-up filter panels.

**Technical Implementations:**
- **Database:** Supabase PostgreSQL is used, with all application tables residing in the `public` schema. JSON columns are `JSONB`. `created_at` and `updated_at` fields are automatically managed with triggers. Critical RLS policies and performance indexes are applied for security and efficiency.
- **API Endpoints:** Structured API routes for authentication, public catalog, DigitalOcean droplet management, user-scoped operations, admin CRUD, and payment webhooks.
- **Pagination:** Cursor-based pagination (`created_at` + `id`) is implemented for large datasets, with support for offset-based pagination as a fallback.
- **Business Logic:** Centralized in `src/lib/services` for auth, DigitalOcean interaction, catalog, orders, payments, audit, and settings.
- **Input Validation:** Zod schemas used for API input validation and frontend hooks.
- **Frontend Hooks:** `useDataFetch` for standardized API calling, `useFormValidation` for inline Zod-based form validation.
- **Security:** CSP, HSTS, and Permissions-Policy headers are configured. Error sanitization and ILIKE injection protection are implemented.

## External Dependencies
- **Supabase:** Used for PostgreSQL database, authentication (magic link), and real-time capabilities.
- **DigitalOcean API v2:** Integrates for droplet management functionalities.
- **Mayar (Sandbox):** Indonesian payment gateway for processing payments, utilizing `createInvoice()` and `createPayment()` APIs, and handling webhooks for payment status updates.
- **Next.js 14 (App Router):** The primary React framework for building the application.
- **Tailwind CSS 3.4:** Utility-first CSS framework for styling.
- **TypeScript:** The primary programming language.
- **Lucide React:** Icon library.
- **Outfit & Plus Jakarta Sans:** Custom fonts used for headings and body text, respectively.

## Database (Supabase PostgreSQL)
Tables: `users`, `products`, `product_categories`, `product_types`, `product_stock_items`, `orders`, `order_items`, `transactions`, `payment_events`, `entitlements`, `site_settings`, `audit_logs`, `wishlists`, `cart_items`

Pricing is stored directly on the `products` table (`price_amount`, `price_currency`, `price_billing_period`) — no separate pricing table.

Key design decisions:
- **Product types** are stored in `product_types` table (type_key, label, description, is_active, fields JSONB). Legacy copy also in `site_settings`
- **Droplets** are NOT stored in DB; they come from DigitalOcean API. Users have `droplet_ids` JSONB column
- **Product stocks** use `product_stock_items` table with `credential_data` JSONB and `credential_hash` for dedup
- **All JSON columns use JSONB** (migrated from json→jsonb in migration 003)
- **updated_at triggers** bound to all tables with `updated_at` via `update_updated_at_column()` function
- **created_at/updated_at defaults** all set to `DEFAULT now()`
- **Server-Synced Cart**: `cart_items` table stores cart state for logged-in users, synced from `CartProvider`.

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

## Cursor-Based Pagination
Large tables (audit logs, orders, transactions) support cursor-based pagination using `created_at` + `id` as the composite cursor. The cursor utility is in `src/lib/cursor-pagination.ts` with `encodeCursor`, `decodeCursor`, and `applyCursorPagination` helpers.

API endpoints accept `cursor` (base64url-encoded), `per_page`, and `mode=cursor|offset` query params. Default mode is `cursor`. Responses include `next_cursor` and `has_more` fields. Offset-based pagination still works by passing `mode=offset` with `page` param.

Admin and user dashboard pages use cursor-based "Load More" pattern for audit logs and orders.

### Incident Log (2026-04-04)
1. `git filter-branch` was run on Replit to remove `env.local` from history. Replit only had 14 local commits. Force-push replaced GitHub's full 188-commit history with just 14 commits.
2. Recovered using GitHub's dangling commit SHA (`426ffeab4ed3bf9cd69b32c40475ee1f977652eb`).
3. Then `git rebase -i` was used to drop the env.local commits, which also wiped the Mayar integration files and all pre-Mayar checkpoint changes from disk.
4. Files were recovered from git reflog (`36c6df1`) but the individual pre-Mayar checkpoint commits (RLS fix, documentation updates, etc.) were lost as separate commits — their changes were squashed into a single new checkpoint.
5. Lesson: NEVER do git history rewriting on Replit. Always tell the user to do it from a full local clone.

## Legacy Archives
- `.archive/legacy-laravel/` - Previous Laravel implementation (source of truth for UI parity)
- `.archive/legacy/` - Original Next.js implementation
