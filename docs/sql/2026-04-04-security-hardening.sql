-- Security hardening migration
-- Date: 2026-04-04
-- Scope: wishlists RLS, orders_update tightening, product_stock_items lockdown, products_public_read fix

begin;

-- ============================================================
-- 1. Wishlists: enable RLS + user-scoped policies + admin read
-- ============================================================
alter table public.wishlists enable row level security;

drop policy if exists wishlists_select_own on public.wishlists;
drop policy if exists wishlists_insert_own on public.wishlists;
drop policy if exists wishlists_delete_own on public.wishlists;
drop policy if exists wishlists_admin_select on public.wishlists;

create policy wishlists_select_own
on public.wishlists
for select
to authenticated
using (public.is_row_owner(user_id) or public.is_admin());

create policy wishlists_insert_own
on public.wishlists
for insert
to authenticated
with check (public.is_row_owner(user_id));

create policy wishlists_delete_own
on public.wishlists
for delete
to authenticated
using (public.is_row_owner(user_id));

grant select, insert, delete on table public.wishlists to authenticated;

-- ============================================================
-- 2. Orders: tighten update policy so users cannot modify
--    status, payment_status, total_amount, subtotal_amount
-- ============================================================
drop policy if exists orders_update_owner_or_admin on public.orders;

create policy orders_update_owner_or_admin
on public.orders
for update
to authenticated
using (public.is_row_owner(user_id) or public.is_admin())
with check (
  public.is_admin()
  or (
    public.is_row_owner(user_id)
    and status = (select o.status from public.orders o where o.id = orders.id)
    and payment_status = (select o.payment_status from public.orders o where o.id = orders.id)
    and total_amount = (select o.total_amount from public.orders o where o.id = orders.id)
    and subtotal_amount = (select o.subtotal_amount from public.orders o where o.id = orders.id)
  )
);

-- ============================================================
-- 3. Product stock items: remove public read, restrict to
--    admin only (credential_data is sensitive)
-- ============================================================
alter table public.product_stock_items enable row level security;

drop policy if exists product_stock_items_public_read on public.product_stock_items;
drop policy if exists product_stock_items_admin_select on public.product_stock_items;
drop policy if exists product_stock_items_admin_insert on public.product_stock_items;
drop policy if exists product_stock_items_admin_update on public.product_stock_items;
drop policy if exists product_stock_items_admin_delete on public.product_stock_items;
drop policy if exists product_stock_items_owner_select on public.product_stock_items;

create policy product_stock_items_admin_select
on public.product_stock_items
for select
to authenticated
using (public.is_admin());

create policy product_stock_items_owner_select
on public.product_stock_items
for select
to authenticated
using (
  sold_user_id = auth.uid()
  and status = 'sold'
);

create policy product_stock_items_admin_insert
on public.product_stock_items
for insert
to authenticated
with check (public.is_admin());

create policy product_stock_items_admin_update
on public.product_stock_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy product_stock_items_admin_delete
on public.product_stock_items
for delete
to authenticated
using (public.is_admin());

revoke all on table public.product_stock_items from anon;
grant select, insert, update, delete on table public.product_stock_items to authenticated;

-- ============================================================
-- 4. Products public read: already correct in the main RLS file
--    (catalog_products_select_public_or_admin uses
--     is_visible = true AND status = 'available')
--    but drop any legacy unconditional policy if it exists
-- ============================================================
drop policy if exists products_public_read on public.products;

commit;
