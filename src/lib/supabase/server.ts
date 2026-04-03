import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client that carries the current user's session (via cookies).
 * Queries made through this client are subject to Row Level Security (RLS) policies,
 * meaning the database enforces access control automatically.
 *
 * USE THIS for all user-facing operations:
 *   - Reading/writing the authenticated user's own data (orders, entitlements, wishlist)
 *   - Querying public data (product catalog, categories)
 *   - Any route under /api/user/*, /api/wishlist/*, /api/cart/*, /api/products/*
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          } catch {
            // ignore in Server Components
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client using the service role key, which bypasses all RLS policies.
 *
 * USE THIS ONLY for operations that genuinely require elevated privileges:
 *   - Admin routes (/api/admin/*) that query across multiple users
 *   - Webhook processing (payment-verification) where there is no user session
 *   - User sync on auth callback (inserting into the users table for new signups)
 *   - Audit logging (system-level inserts)
 *   - Middleware role checks (isAdmin) where RLS would be circular
 *
 * NEVER use this for regular user-facing reads/writes — use createSupabaseServerClient() instead.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
