-- Supabase RLS + RBAC hardening pack
-- Date: 2026-04-02
-- Scope: public.users, product catalog, order flow, entitlements, site settings, audit logs

begin;

-- Phase 1: RBAC helper functions (DB lookup source of truth).
create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_active = true
      and u.role = 'admin'
  );
$$;

create or replace function public.is_row_owner(row_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select auth.uid() = row_user_id and public.is_active_user();
$$;

revoke all on function public.is_active_user() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_row_owner(uuid) from public;

grant execute on function public.is_active_user() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_row_owner(uuid) to anon, authenticated;

-- Phase 2: RLS enablement across all app tables.
alter table public.users enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_prices enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.transactions enable row level security;
alter table public.entitlements enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_logs enable row level security;

-- Phase 3+: Clear old policies so this script is idempotent.
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'users',
    'product_categories',
    'products',
    'product_prices',
    'orders',
    'order_items',
    'transactions',
    'entitlements',
    'site_settings',
    'audit_logs'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', 'users_select_self_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'users_insert_self_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'users_update_self_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'users_delete_admin', tbl);

    execute format('drop policy if exists %I on public.%I', 'catalog_categories_select_public', tbl);
    execute format('drop policy if exists %I on public.%I', 'catalog_products_select_public_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'catalog_prices_select_public_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'catalog_admin_insert', tbl);
    execute format('drop policy if exists %I on public.%I', 'catalog_admin_update', tbl);
    execute format('drop policy if exists %I on public.%I', 'catalog_admin_delete', tbl);

    execute format('drop policy if exists %I on public.%I', 'orders_select_owner_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'orders_insert_owner_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'orders_update_owner_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'orders_delete_admin', tbl);

    execute format('drop policy if exists %I on public.%I', 'order_items_select_owner_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'order_items_insert_owner_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'order_items_update_owner_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'order_items_delete_admin', tbl);

    execute format('drop policy if exists %I on public.%I', 'transactions_select_owner_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'transactions_insert_owner_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'transactions_update_owner_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'transactions_delete_admin', tbl);

    execute format('drop policy if exists %I on public.%I', 'entitlements_select_owner_or_admin', tbl);
    execute format('drop policy if exists %I on public.%I', 'entitlements_admin_insert', tbl);
    execute format('drop policy if exists %I on public.%I', 'entitlements_admin_update', tbl);
    execute format('drop policy if exists %I on public.%I', 'entitlements_admin_delete', tbl);

    execute format('drop policy if exists %I on public.%I', 'site_settings_admin_select', tbl);
    execute format('drop policy if exists %I on public.%I', 'site_settings_admin_insert', tbl);
    execute format('drop policy if exists %I on public.%I', 'site_settings_admin_update', tbl);
    execute format('drop policy if exists %I on public.%I', 'site_settings_admin_delete', tbl);

    execute format('drop policy if exists %I on public.%I', 'audit_logs_admin_select', tbl);

    execute format('drop policy if exists %I on public.%I', 'Users can read own data', tbl);
  end loop;
end $$;

-- users
create policy users_select_self_or_admin
on public.users
for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy users_insert_self_or_admin
on public.users
for insert
to authenticated
with check (id = auth.uid() or public.is_admin());

create policy users_update_self_or_admin
on public.users
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy users_delete_admin
on public.users
for delete
to authenticated
using (public.is_admin());

-- catalog public read + admin write
create policy catalog_categories_select_public
on public.product_categories
for select
to anon, authenticated
using (true);

create policy catalog_products_select_public_or_admin
on public.products
for select
to anon, authenticated
using ((is_visible = true and status = 'available') or public.is_admin());

create policy catalog_prices_select_public_or_admin
on public.product_prices
for select
to anon, authenticated
using (
  (
    status = 'active'
    and exists (
      select 1
      from public.products p
      where p.id = product_prices.product_id
        and p.is_visible = true
        and p.status = 'available'
    )
  )
  or public.is_admin()
);

create policy catalog_admin_insert
on public.product_categories
for insert
to authenticated
with check (public.is_admin());

create policy catalog_admin_update
on public.product_categories
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy catalog_admin_delete
on public.product_categories
for delete
to authenticated
using (public.is_admin());

create policy catalog_admin_insert
on public.products
for insert
to authenticated
with check (public.is_admin());

create policy catalog_admin_update
on public.products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy catalog_admin_delete
on public.products
for delete
to authenticated
using (public.is_admin());

create policy catalog_admin_insert
on public.product_prices
for insert
to authenticated
with check (public.is_admin());

create policy catalog_admin_update
on public.product_prices
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy catalog_admin_delete
on public.product_prices
for delete
to authenticated
using (public.is_admin());

-- orders: owner scope + admin full access
create policy orders_select_owner_or_admin
on public.orders
for select
to authenticated
using (public.is_row_owner(user_id) or public.is_admin());

create policy orders_insert_owner_or_admin
on public.orders
for insert
to authenticated
with check (public.is_row_owner(user_id) or public.is_admin());

create policy orders_update_owner_or_admin
on public.orders
for update
to authenticated
using (public.is_row_owner(user_id) or public.is_admin())
with check (public.is_row_owner(user_id) or public.is_admin());

create policy orders_delete_admin
on public.orders
for delete
to authenticated
using (public.is_admin());

-- order_items: ownership resolved through parent order
create policy order_items_select_owner_or_admin
on public.order_items
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and public.is_row_owner(o.user_id)
  )
);

create policy order_items_insert_owner_or_admin
on public.order_items
for insert
to authenticated
with check (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and public.is_row_owner(o.user_id)
  )
);

create policy order_items_update_owner_or_admin
on public.order_items
for update
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and public.is_row_owner(o.user_id)
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and public.is_row_owner(o.user_id)
  )
);

create policy order_items_delete_admin
on public.order_items
for delete
to authenticated
using (public.is_admin());

-- transactions: ownership resolved through parent order
create policy transactions_select_owner_or_admin
on public.transactions
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = transactions.order_id
      and public.is_row_owner(o.user_id)
  )
);

create policy transactions_insert_owner_or_admin
on public.transactions
for insert
to authenticated
with check (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = transactions.order_id
      and public.is_row_owner(o.user_id)
  )
);

create policy transactions_update_owner_or_admin
on public.transactions
for update
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = transactions.order_id
      and public.is_row_owner(o.user_id)
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = transactions.order_id
      and public.is_row_owner(o.user_id)
  )
);

create policy transactions_delete_admin
on public.transactions
for delete
to authenticated
using (public.is_admin());

-- entitlements
create policy entitlements_select_owner_or_admin
on public.entitlements
for select
to authenticated
using (public.is_row_owner(user_id) or public.is_admin());

create policy entitlements_admin_insert
on public.entitlements
for insert
to authenticated
with check (public.is_admin());

create policy entitlements_admin_update
on public.entitlements
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy entitlements_admin_delete
on public.entitlements
for delete
to authenticated
using (public.is_admin());

-- site settings
create policy site_settings_admin_select
on public.site_settings
for select
to authenticated
using (public.is_admin());

create policy site_settings_admin_insert
on public.site_settings
for insert
to authenticated
with check (public.is_admin());

create policy site_settings_admin_update
on public.site_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy site_settings_admin_delete
on public.site_settings
for delete
to authenticated
using (public.is_admin());

-- audit logs
create policy audit_logs_admin_select
on public.audit_logs
for select
to authenticated
using (public.is_admin());

-- Phase 6: privilege hardening.
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

revoke all on all sequences in schema public from anon;
revoke all on all sequences in schema public from authenticated;

grant usage on schema public to anon, authenticated;

grant select on table public.product_categories to anon;
grant select on table public.products to anon;
grant select on table public.product_prices to anon;

grant select on table public.users to authenticated;
grant insert on table public.users to authenticated;
grant update on table public.users to authenticated;
grant delete on table public.users to authenticated;

grant select on table public.product_categories to authenticated;
grant insert on table public.product_categories to authenticated;
grant update on table public.product_categories to authenticated;
grant delete on table public.product_categories to authenticated;

grant select on table public.products to authenticated;
grant insert on table public.products to authenticated;
grant update on table public.products to authenticated;
grant delete on table public.products to authenticated;

grant select on table public.product_prices to authenticated;
grant insert on table public.product_prices to authenticated;
grant update on table public.product_prices to authenticated;
grant delete on table public.product_prices to authenticated;

grant select on table public.orders to authenticated;
grant insert on table public.orders to authenticated;
grant update on table public.orders to authenticated;
grant delete on table public.orders to authenticated;

grant select on table public.order_items to authenticated;
grant insert on table public.order_items to authenticated;
grant update on table public.order_items to authenticated;
grant delete on table public.order_items to authenticated;

grant select on table public.transactions to authenticated;
grant insert on table public.transactions to authenticated;
grant update on table public.transactions to authenticated;
grant delete on table public.transactions to authenticated;

grant select on table public.entitlements to authenticated;
grant insert on table public.entitlements to authenticated;
grant update on table public.entitlements to authenticated;
grant delete on table public.entitlements to authenticated;

grant select on table public.site_settings to authenticated;
grant insert on table public.site_settings to authenticated;
grant update on table public.site_settings to authenticated;
grant delete on table public.site_settings to authenticated;

grant select on table public.audit_logs to authenticated;

grant usage, select on sequence public.product_categories_id_seq to authenticated;
grant usage, select on sequence public.products_id_seq to authenticated;
grant usage, select on sequence public.product_prices_id_seq to authenticated;
grant usage, select on sequence public.orders_id_seq to authenticated;
grant usage, select on sequence public.order_items_id_seq to authenticated;
grant usage, select on sequence public.transactions_id_seq to authenticated;
grant usage, select on sequence public.entitlements_id_seq to authenticated;
grant usage, select on sequence public.site_settings_id_seq to authenticated;
grant usage, select on sequence public.audit_logs_id_seq to authenticated;

commit;
