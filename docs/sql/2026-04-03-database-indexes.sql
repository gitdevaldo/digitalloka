-- Database Indexing & Full-Text Search Migration
-- Date: 2026-04-03
-- Scope: Performance indexes for RLS policies, catalog queries, idempotency,
--         entitlement checks, stock import dedup, and trigram search.
-- Idempotent: all statements use IF NOT EXISTS / CREATE EXTENSION IF NOT EXISTS.

begin;

-- ============================================================
-- 1. Enable pg_trgm extension for trigram-based ILIKE search
-- ============================================================
create extension if not exists pg_trgm;

-- ============================================================
-- 2. RLS policy indexes (audit #22)
--    order_items and transactions RLS policies join to orders
--    via order_id; without indexes every policy check seq-scans.
-- ============================================================
create index if not exists idx_order_items_order_id
  on public.order_items (order_id);

create index if not exists idx_transactions_order_id
  on public.transactions (order_id);

-- ============================================================
-- 3. Payment idempotency index (audit #26)
--    payment_events.idempotency_key must be unique to prevent
--    duplicate payment processing and speed up lookups.
-- ============================================================
create unique index if not exists idx_payment_events_idempotency_key
  on public.payment_events (idempotency_key)
  where idempotency_key is not null;

-- ============================================================
-- 4. Composite catalog indexes (audit #24)
--    The RLS policy on products filters by (is_visible, status)
--    and catalog queries additionally filter by category_slug.
-- ============================================================
create index if not exists idx_products_visible_status_category
  on public.products (is_visible, status, category_slug);

create index if not exists idx_products_slug
  on public.products (slug);

-- ============================================================
-- 5. GIN trigram index for ILIKE product search (audit #23)
--    Catalog search does:
--      name ilike '%term%' or short_description ilike '%term%'
--    A GIN trigram index on both columns makes this fast.
-- ============================================================
create index if not exists idx_products_name_trgm
  on public.products
  using gin (name gin_trgm_ops);

create index if not exists idx_products_short_description_trgm
  on public.products
  using gin (short_description gin_trgm_ops);

-- ============================================================
-- 6. Entitlement existence check index
--    orders.ts checks: entitlements where order_item_id = ? and user_id = ?
-- ============================================================
create index if not exists idx_entitlements_order_item_user
  on public.entitlements (order_item_id, user_id);

-- ============================================================
-- 7. Product stock import duplicate check index
--    SKIPPED: product_stock_items(product_id, credential_hash) already has
--    a unique index (idx_product_stock_items_hash) from the initial migration
--    at supabase/migrations/001_create_product_stock_items.sql.
-- ============================================================

commit;
