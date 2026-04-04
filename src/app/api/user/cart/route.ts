import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ items: [] });
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select('product_id, quantity, config_id, meta')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ items: [], error: sanitizeDbError(error.message) }, { status: 500 });
  }

  return NextResponse.json({
    items: (data || []).map((r: { product_id: number; quantity: number; config_id: string | null; meta: Record<string, unknown> | null }) => ({
      productId: r.product_id,
      quantity: r.quantity,
      ...(r.config_id && { configId: r.config_id }),
      ...(r.meta?.selectedStockId && { selectedStockId: r.meta.selectedStockId }),
      ...(r.meta?.selectedRegion && { selectedRegion: r.meta.selectedRegion }),
      ...(r.meta?.selectedImage && { selectedImage: r.meta.selectedImage }),
      ...(r.meta?.vpsConfig && { vpsConfig: r.meta.vpsConfig }),
    })),
  });
}

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const items: Array<{
    productId: number;
    quantity: number;
    configId?: string;
    selectedStockId?: number;
    selectedRegion?: string;
    selectedImage?: string;
    vpsConfig?: Record<string, unknown>;
  }> = body.items;

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'items must be an array' }, { status: 400 });
  }

  const { error: deleteError } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  if (deleteError) {
    return NextResponse.json({ error: sanitizeDbError(deleteError.message) }, { status: 500 });
  }

  if (items.length > 0) {
    const rows = items.map(i => {
      const meta: Record<string, unknown> = {};
      if (i.selectedStockId) meta.selectedStockId = i.selectedStockId;
      if (i.selectedRegion) meta.selectedRegion = i.selectedRegion;
      if (i.selectedImage) meta.selectedImage = i.selectedImage;
      if (i.vpsConfig) meta.vpsConfig = i.vpsConfig;

      return {
        user_id: user.id,
        product_id: i.productId,
        quantity: Math.min(Math.max(i.quantity, 1), 50),
        config_id: i.configId || null,
        meta: Object.keys(meta).length > 0 ? meta : null,
      };
    });

    const { error: insertError } = await supabase
      .from('cart_items')
      .insert(rows);

    if (insertError) {
      console.error('[cart PUT] Insert error:', insertError.message);
      return NextResponse.json({ error: sanitizeDbError(insertError.message) }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
