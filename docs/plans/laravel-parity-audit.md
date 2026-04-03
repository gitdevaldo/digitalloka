# Laravel Parity Audit — Fix All Pages to Match Exactly

## Objective
Ensure every page in the Next.js app matches the Laravel version exactly.

## Tasks

### T001: Add Wishlist + Cart to catalog topbar
- **Files**: `src/app/(public)/layout.tsx`
- **Gap**: Laravel catalog topbar has Wishlist (ghost btn with heart icon + count) and Cart (accent btn with bag icon + count). Next.js only has Login.
- **Fix**: Add Wishlist + Cart buttons matching Laravel exactly.

### T002: Fix Login pages to match Laravel exactly
- **Files**: `src/app/login/page.tsx`, `src/app/admin/login/page.tsx`
- **Gap**: Laravel login uses:
  - Radial gradient background (accent-soft at 20% 20%, amber at 80% 80%)
  - Different accent per mode: user = `#0EA5E9` (sky blue), admin = `#F43F5E` (rose)
  - Card: `width: min(540px, 100%)`, `border-radius: 28px`, `box-shadow: 10px 10px 0`
  - Badge pill at top ("User Dashboard" / "Admin Access")
  - Label/input/button match specific sizing
  - Button: pill (999px radius), accent bg, 4px shadow, hover 6px
- **Fix**: Rewrite both login pages to match Laravel styling.

### T003: Fix Auth callback page
- **Files**: `src/app/auth/callback/page.tsx`
- **Gap**: Laravel uses simple centered `.status` div with 16px radius, 6px shadow, no BrandLogo, no emoji. Next.js has BrandLogo, emoji, and different styling.
- **Fix**: Match Laravel callback exactly.

### T004: Fix Product detail page
- **Files**: `src/app/(public)/products/[slug]/page.tsx`
- **Gap**: Laravel show.blade.php has rich hero layout (2-col grid), breadcrumb, badge row, hero title with `.hl` highlight, tagline, spec grid (4-col), status row with uptime bar, includes checklist, purchase card (sticky sidebar with server stack visual, billing toggle, price area, CTA buttons, guarantee strip, card specs), plan comparison grid, features grid, setup timeline, reviews section, FAQ accordion, sticky bottom bar. Next.js version is much simpler.
- **Fix**: Rebuild product detail page to match Laravel show.blade.php exactly.

### T005: Fix Dashboard/Admin topbar — already correct but verify
- **Files**: `src/components/layout/topbar.tsx`
- **Gap**: Dashboard topbar matches Laravel (brand in sidebar-width zone, search, bell, avatar). Admin topbar has Admin pill. Already good.
- **Status**: ✅ OK

### T006: Verify Dashboard pages match
- Dashboard overview, droplets, products, orders, account — all look structurally correct. The Laravel dashboard uses a mega SPA but the Next.js version properly splits into separate route pages with the same components (PageHeader, Panel, TableShell, StatusBadge). Visual styling matches.
- **Status**: ✅ OK (matching via shared components)

### T007: Verify Admin pages match
- Admin overview, products, users, orders, settings, audit-logs — all exist and use the same shared components.
- **Status**: ✅ OK

### T008: API filter gap fix
- **Files**: `src/app/api/products/route.ts`
- **Gap**: `max_price`, `rating_min`, `tags`, `badges` query params not applied to DB query.
- **Fix**: Wire filter params to Supabase query.

## Acceptance Criteria
- All pages visually identical to Laravel version
- Wishlist + Cart in catalog header
- Login pages use correct accent colors and card styling per mode
- Product detail matches Laravel's rich layout
