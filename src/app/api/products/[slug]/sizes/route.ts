import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createSupabaseAdminClient();

  const { data: product } = await admin
    .from('products')
    .select('id, product_type')
    .eq('slug', slug)
    .single();

  if (!product || product.product_type !== 'vps_droplet') {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const { data: stocks, error } = await admin
    .from('product_stock_items')
    .select('id, credential_data, is_unlimited')
    .eq('product_id', product.id)
    .eq('status', 'enabled')
    .order('credential_data->price_monthly', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to load sizes' }, { status: 500 });
  }

  const sizes = (stocks || []).map(s => {
    const cred = s.credential_data as Record<string, unknown>;
    return {
      stock_id: s.id,
      slug: cred.slug,
      description: cred.description,
      memory: cred.memory,
      vcpus: cred.vcpus,
      disk: cred.disk,
      transfer: cred.transfer,
      price_monthly: cred.price_monthly,
      price_hourly: cred.price_hourly,
      available: cred.available,
      regions: cred.regions,
    };
  }).filter(s => s.available);

  return NextResponse.json({ data: sizes });
}
