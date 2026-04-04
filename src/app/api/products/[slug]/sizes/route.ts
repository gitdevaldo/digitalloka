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
  const productProvider = typeFields.provider || '';

  const { data: stocks, error } = await admin
    .from('product_stock_items')
    .select('id, credential_data, is_unlimited, meta')
    .eq('product_id', product.id)
    .eq('status', 'enabled')
    .order('credential_data->price_monthly', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to load sizes' }, { status: 500 });
  }

  const sizes = (stocks || []).map(s => {
    const cred = s.credential_data as Record<string, unknown>;
    const meta = (s.meta as Record<string, unknown>) || {};
    const costPrice = (cred.price_monthly as number) || 0;
    const sellingPrice = meta.selling_price !== undefined ? Number(meta.selling_price) : costPrice;
    const provider = (meta.provider as string) || productProvider || 'Unknown';
    return {
      stock_id: s.id,
      slug: cred.slug,
      description: cred.description,
      memory: cred.memory,
      vcpus: cred.vcpus,
      disk: cred.disk,
      transfer: cred.transfer,
      price_monthly: sellingPrice,
      cost_price: costPrice,
      price_hourly: cred.price_hourly,
      available: cred.available,
      regions: cred.regions,
      provider,
    };
  }).filter(s => s.available);

  return NextResponse.json({ data: sizes });
}
