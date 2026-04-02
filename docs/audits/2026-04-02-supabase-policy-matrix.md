# Supabase Policy Matrix

Date: 2026-04-02
Scope: public.users, product catalog, orders, order_items, transactions, entitlements, site_settings, audit_logs
RBAC source of truth: DB lookup via public.users (role + is_active) through helper functions.

## Actor Definitions

- Anonymous: PostgreSQL role `anon` (no user identity).
- Authenticated user: PostgreSQL role `authenticated`, `auth.uid()` present, non-admin user row in `public.users`.
- Admin user: PostgreSQL role `authenticated`, user row where `is_active = true` and `role in ('admin','super-admin')`.

## Helper Functions

- `public.is_active_user()` returns true if `auth.uid()` exists and is active in `public.users`.
- `public.is_admin()` returns true if `auth.uid()` is active and has admin role.
- `public.is_row_owner(user_id uuid)` returns true if `auth.uid() = user_id` and user is active.

## Access Matrix

| Table | Anonymous (`anon`) | Authenticated user | Admin user |
| --- | --- | --- | --- |
| `users` | No access | Select/insert/update own row only | Full CRUD |
| `product_categories` | Select all | Select all | Full CRUD |
| `products` | Select only visible + available | Select visible + available | Full CRUD |
| `product_prices` | Select only active prices tied to visible + available products | Same as anon | Full CRUD |
| `orders` | No access | Select/insert/update own rows | Full CRUD |
| `order_items` | No access | Select/insert/update only items linked to own orders | Full CRUD |
| `transactions` | No access | Select/insert/update only rows linked to own orders | Full CRUD |
| `entitlements` | No access | Select own rows | Full CRUD |
| `site_settings` | No access | No access | Full CRUD |
| `audit_logs` | No access | No access | Select only |

## Grant Hardening Summary

- Revoked all table + sequence privileges from `anon` and `authenticated` first.
- Re-granted minimum required table privileges for `anon` and `authenticated`.
- `anon` receives select-only grants for public catalog tables (`product_categories`, `products`, `product_prices`).
- `authenticated` receives table privileges needed for policy-controlled access across app tables.
- Sequence usage/select grants were applied to target sequences for `authenticated` inserts.

## Verification Checklist

- RLS enabled on all target tables (`relrowsecurity = true`).
- Policy set exists for all target tables and intended commands.
- Grants for `anon` and `authenticated` match least-privilege intent.
- Helper functions exist as `SECURITY DEFINER` and `STABLE`.
- Functional behavior checks should confirm:
  - Anonymous cannot access user-owned/admin-only data.
  - Authenticated user cannot access other users' orders, items, transactions, or entitlements.
  - Admin can perform management operations on protected datasets.
