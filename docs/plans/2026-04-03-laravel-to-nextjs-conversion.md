# Plan: Laravel → Next.js Conversion

**Date:** 2026-04-03
**Goal:** Convert the Laravel DigitalLoka app to Next.js (App Router) while preserving all features, UI, and enhancements added since the original Next.js→Laravel migration.

---

## Scope Summary

### What exists in Laravel (to be ported)

**Pages (Blade views → React pages):**
| Area | Laravel View | Next.js Target |
|------|-------------|----------------|
| Catalog | `catalog/index.blade.php` | `app/(public)/page.tsx` |
| Catalog | `catalog/show.blade.php` + partials | `app/(public)/products/[slug]/page.tsx` |
| Auth | `auth/login.blade.php` | `app/login/page.tsx` |
| Auth | `auth/callback.blade.php` | `app/auth/callback/page.tsx` |
| Admin Auth | admin login variant | `app/admin/login/page.tsx` |
| Dashboard | `dashboard/overview.blade.php` | `app/dashboard/page.tsx` |
| Dashboard | `dashboard/droplets.blade.php` | `app/dashboard/droplets/page.tsx` |
| Dashboard | `dashboard/products.blade.php` | `app/dashboard/products/page.tsx` |
| Dashboard | `dashboard/orders.blade.php` | `app/dashboard/orders/page.tsx` |
| Dashboard | account, support, wishlist | `app/dashboard/account/`, etc. |
| Admin | `admin/overview.blade.php` | `app/admin/page.tsx` |
| Admin | `admin/products.blade.php` | `app/admin/products/page.tsx` |
| Admin | `admin/users.blade.php` | `app/admin/users/page.tsx` |
| Admin | `admin/orders.blade.php` | `app/admin/orders/page.tsx` |
| Admin | `admin/settings.blade.php` | `app/admin/settings/page.tsx` |
| Admin | audit-logs | `app/admin/audit-logs/page.tsx` |

**API Routes (Laravel controllers → Next.js Route Handlers):**
| Group | Endpoints |
|-------|-----------|
| Auth | `POST /api/auth/login`, `/session`, `/logout` |
| Catalog | `GET /api/products`, `GET /api/products/[slug]` |
| User | `GET /api/user/products`, `POST /api/user/products/[id]/actions`, orders, checkout |
| Droplets | `GET /api/droplets`, `GET /api/droplets/[id]`, `POST /api/droplets/[id]/actions` |
| Admin | Products CRUD, orders status, users access, settings, audit-logs, entitlements, stock |
| Payments | `POST /api/payments/webhook` |

**Services (PHP → TypeScript):**
- `SupabaseAuthService` → `lib/services/supabase-auth.ts`
- `DigitalOceanService` → `lib/services/digitalocean.ts`
- `OrderService` → `lib/services/orders.ts`
- `PaymentVerificationService` → `lib/services/payment-verification.ts`
- `ProductStockService` → `lib/services/product-stock.ts`
- `EntitlementService` → `lib/services/entitlements.ts`
- `CatalogService` → `lib/services/catalog.ts`
- `AuditLogService` → `lib/services/audit-log.ts`
- `SiteSettingService` → `lib/services/site-settings.ts`
- `AdminAccessService` → `lib/services/admin-access.ts`
- `DropletAccessService` → `lib/services/droplet-access.ts`

**Middleware (PHP → Next.js middleware):**
- `EnsureSupabaseAuthenticated` → `middleware.ts` matcher for `/dashboard/*`
- `EnsureSupabaseAdminAuthenticated` → `middleware.ts` matcher for `/admin/*`
- `EnsureSameOrigin` → origin check in API route handlers

**Models (Eloquent → Supabase/Drizzle types):**
- User, Product, ProductCategory, ProductPrice, Order, OrderItem, Transaction, Entitlement, UserProductAction, AuditLog, SiteSetting, ProductStockItem, PaymentEvent

**UI Components (Blade → React):**
- Layout: topbar, sidebar-shell, page-header
- UI: button, panel, table-shell, status-badge, avatar-chip, empty-state, toast, modal, filter-bar
- Neo-Brutalist design tokens (CSS variables, fonts, shadows, animations)

---

## Implementation Tasks

### Phase 1: Project Scaffold & Design System
1. Initialize Next.js 15 App Router project with TypeScript
2. Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, `zod`
3. Port design system: CSS variables, fonts (Outfit + Plus Jakarta Sans), Neo-Brutalist tokens
4. Set up Tailwind config matching brand guidelines
5. Port all reusable UI components (button, panel, badge, modal, toast, table, empty-state, avatar-chip)

### Phase 2: Auth & Middleware
1. Set up Supabase client (browser + server)
2. Implement magic link login flow
3. Implement auth callback handler
4. Set up Next.js middleware for route protection (dashboard + admin)
5. Port admin role checking

### Phase 3: Public Pages
1. Catalog index with filtering (category, price, tags, search, sort)
2. Product detail page with droplet/digital variants
3. Layout with topbar, navigation

### Phase 4: Dashboard Pages
1. Dashboard layout (sidebar + topbar)
2. Overview page
3. Droplets page with power controls
4. Products page (user entitlements)
5. Orders page
6. Account, Support, Wishlist pages

### Phase 5: Admin Pages
1. Admin layout (pink-themed variant)
2. Overview page
3. Products management (CRUD + stock import)
4. Users management
5. Orders management
6. Site settings
7. Audit logs

### Phase 6: API Routes (Server-Side)
1. Auth endpoints (login, session, logout)
2. Catalog endpoints
3. User endpoints (products, orders, checkout)
4. Droplet endpoints (list, detail, actions)
5. Admin endpoints (all CRUD)
6. Payment webhook endpoint
7. Origin validation for sensitive endpoints

### Phase 7: Service Layer
1. SupabaseAuthService (JWT validation, magic link, session caching)
2. DigitalOceanService (droplet API wrapper with caching)
3. OrderService (checkout, status transitions, entitlement grants)
4. PaymentVerificationService (HMAC verification, webhook processing)
5. ProductStockService (batch import, reservation)
6. EntitlementService, CatalogService, AuditLogService, SiteSettingService
7. Access control services (admin, droplet ownership)

### Phase 8: Cleanup & Verification
1. Remove Laravel files (app/, config/, routes/, resources/, etc.)
2. Update `.claude/CLAUDE.md` for Next.js stack
3. Update `replit.md`
4. Verify all pages render
5. Verify all API routes respond
6. Configure Replit workflow

---

## Acceptance Criteria
- All pages from the Laravel app render in Next.js with identical UI/UX
- All API endpoints exist with same request/response contracts
- Auth flow works (magic link → callback → session → protected routes)
- Admin and user route protection via middleware
- DigitalOcean droplet operations work through the service layer
- Commerce flow intact (catalog → checkout → payment → entitlement)
- Neo-Brutalist design system fully preserved
- App runs on Replit (port 5000, workflow configured)
- No secrets exposed to client-side code
