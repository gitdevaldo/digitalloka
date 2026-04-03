# DigitalLoka - DigitalOcean Panel & Digital Product Marketplace

## Overview
Next.js 15 App Router application with Neo-Brutalist UI design, featuring DigitalOcean droplet management, a digital product marketplace, commerce/checkout system, and admin panel.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
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
│   ├── dashboard/         # User dashboard (droplets, products, orders, account)
│   ├── admin/(dashboard)/ # Admin panel with sidebar (products, users, orders, settings, audit logs)
│   └── api/               # Route handlers
│       ├── auth/          # login, session, logout
│       ├── products/      # Public catalog API
│       ├── droplets/      # DigitalOcean droplet management
│       ├── user/          # User-scoped products, orders, checkout
│       ├── admin/         # Admin CRUD (products, users, orders, settings, audit-logs, entitlements)
│       └── payments/      # Webhook processing
├── components/
│   ├── ui/                # Button, StatusBadge, Panel, Modal, Toast, EmptyState, etc.
│   └── layout/            # DashboardShell, Topbar, Sidebar, PageHeader, BrandLogo
└── lib/
    ├── supabase/          # Server, browser, middleware clients
    ├── services/          # Business logic (auth, DO, catalog, orders, payments, audit, settings)
    └── utils.ts           # cn(), formatCurrency(), formatDate()
```

## Design System (Neo-Brutalist)
- Background: `#FFFDF5` (warm cream) with dot grid pattern (24px spacing)
- Borders: `border-2 border-foreground` everywhere
- Shadows: `shadow-pop` (4px 4px 0), hover state pushes to 6-7px
- Catalog cards: `rounded-[32px]` (--radius-xl), hover translate(-3px,-3px) with 7px shadow
- Dashboard/Admin cards: `rounded-[20px]` (--r-xl), hover translate(-2px,-2px) with 6px shadow
- Colors: Purple (accent #8B5CF6), Pink (secondary #F472B6), Amber (tertiary #FBBF24), Green (quaternary #34D399)
- Brand logo: Purple bg box with white "Digital" + amber "Loka"
- Catalog layout: Fixed topbar + left sidebar (256px) with filter chips + main content with hero strip

## Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DIGITALOCEAN_TOKEN` - DigitalOcean API token

## Key Features
1. **Catalog/Marketplace** - Public product browsing with search, sort, filtering
2. **Magic Link Auth** - Passwordless login for users and admin
3. **Dashboard** - Droplet management (power on/off/reboot), product entitlements, order history
4. **Admin Panel** - Product CRUD, user management, order status transitions, site settings, audit logs
5. **Commerce** - Checkout flow, payment webhooks with idempotency, entitlement provisioning
6. **Route Protection** - Middleware guards `/dashboard/*` and `/admin/*` routes

## Legacy Archives
- `.archive/legacy-laravel/` - Previous Laravel implementation
- `.archive/legacy/` - Original Next.js implementation
