-- Verification script for Supabase RLS + RBAC hardening
-- Date: 2026-04-02

-- 1) RLS flags on target tables
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'users',
    'product_categories',
    'products',
    'product_prices',
    'orders',
    'order_items',
    'transactions',
    'entitlements',
    'site_settings',
    'audit_logs',
    'wishlists',
    'product_stock_items'
  )
order by c.relname;

-- 2) Policy inventory
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  permissive,
  coalesce(qual, 'N/A') as using_expr,
  coalesce(with_check, 'N/A') as with_check_expr
from pg_policies
where schemaname = 'public'
  and tablename in (
    'users',
    'product_categories',
    'products',
    'product_prices',
    'orders',
    'order_items',
    'transactions',
    'entitlements',
    'site_settings',
    'audit_logs',
    'wishlists',
    'product_stock_items'
  )
order by tablename, policyname, cmd;

-- 3) Coverage summary by command
select
  tablename,
  bool_or(cmd = 'SELECT') as has_select,
  bool_or(cmd = 'INSERT') as has_insert,
  bool_or(cmd = 'UPDATE') as has_update,
  bool_or(cmd = 'DELETE') as has_delete,
  count(*) as policy_count
from pg_policies
where schemaname = 'public'
  and tablename in (
    'users',
    'product_categories',
    'products',
    'product_prices',
    'orders',
    'order_items',
    'transactions',
    'entitlements',
    'site_settings',
    'audit_logs',
    'wishlists',
    'product_stock_items'
  )
group by tablename
order by tablename;

-- 4) Grants matrix on target tables
select
  table_name,
  grantee,
  string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
  and table_name in (
    'users',
    'product_categories',
    'products',
    'product_prices',
    'orders',
    'order_items',
    'transactions',
    'entitlements',
    'site_settings',
    'audit_logs',
    'wishlists',
    'product_stock_items'
  )
group by table_name, grantee
order by table_name, grantee;

-- 5) Helper function presence
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as args,
  p.prosecdef as security_definer,
  p.provolatile as volatility
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('is_active_user', 'is_admin', 'is_row_owner')
order by p.proname;
