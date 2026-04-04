import { NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async () => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from('users').select('*').order('created_at', { ascending: false });
  if (error) return apiError(sanitizeDbError(error.message), 500);
  return NextResponse.json({ data: data || [] });
});
