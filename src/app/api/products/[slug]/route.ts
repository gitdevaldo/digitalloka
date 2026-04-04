import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getProductBySlug } from '@/lib/services/catalog';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async (_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const product = await getProductBySlug(supabase, slug);
  if (!product) return apiError('Product not found', 404);
  const response = apiSuccess(product);
  response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  return response;
});
