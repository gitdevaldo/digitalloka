# DigitalLoka Laravel Workspace

DigitalLoka is now implemented as a Laravel-first workspace focused on droplet operations plus product expansion modules.

## Implemented Modules

1. Existing droplet management parity
- Auth login/logout callback routes and droplet action routes remain available.

2. Product expansion schema
- Added migrations for:
   - products, categories, prices
   - orders, order items, transactions
   - entitlements, licenses
   - affiliate accounts and referrals
   - site settings and audit logs
   - user role and active-status fields

3. Service layer
- Catalog, commerce, entitlement, license, affiliate, settings, reminder, admin access, and audit services.

4. API surfaces
- Public APIs: catalog list/detail.
- User APIs: purchased products, orders, checkout, licenses, product actions.
- Admin APIs: orders, users, entitlements, settings.
- Parity APIs: license issue/validate/revoke, affiliate baseline, reminder trigger endpoint.

5. Web surfaces (Blade)
- Public catalog pages.
- Customer dashboard pages (droplets/products/orders/licenses).
- Admin pages (overview/orders/users/settings).

## Setup Prerequisites

1. Install PHP 8.2+.
2. Install Composer.
3. Run `composer install`.
4. Copy `.env.example` to `.env` and fill secrets.

## Current Limitation

This repository does not yet include a full generated Laravel runtime skeleton (`artisan`, `bootstrap/`, full `config/` set, and vendor install output are environment-dependent). The implemented code is source-ready and structured for execution once standard Laravel bootstrap files are present.

## Next Execution Steps

1. Generate/bootstrap full Laravel runtime files.
2. Run migrations in the target environment.
3. Execute feature tests for public/user/admin route policies.
4. Wire real payment provider + notification channels.
5. Continue parity iterations for affiliate payouts and richer automation workflows.
