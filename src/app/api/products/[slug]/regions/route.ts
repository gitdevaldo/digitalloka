import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createSupabaseAdminClient();

  const { data: product } = await admin
    .from('products')
    .select('id, product_type, meta')
    .eq('slug', slug)
    .single();

  if (!product || product.product_type !== 'vps_droplet') {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const productMeta = (product.meta as Record<string, unknown>) || {};
  const typeFields = (productMeta.type_fields as Record<string, string>) || {};
  const productProvider = typeFields.provider || 'DigitalOcean';

  const { data: regions, error } = await admin
    .from('vps_provider_data')
    .select('slug, name, available, data')
    .eq('provider', productProvider)
    .eq('resource_type', 'region')
    .eq('available', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('[regions API] Error:', error.message, 'provider:', productProvider);
    return NextResponse.json({ error: 'Failed to load regions' }, { status: 500 });
  }

  return NextResponse.json({ data: regions || [] });
}
