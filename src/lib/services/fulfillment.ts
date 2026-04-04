import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { createDroplet } from '@/lib/services/digitalocean';
import type { Json } from '@/lib/supabase/database.types';

export interface FulfillmentResult {
  success: boolean;
  product_type: string;
  product_id: number;
  details: Record<string, unknown>;
  error?: string;
}

export async function fulfillOrder(orderId: number, userId: string): Promise<FulfillmentResult[]> {
  const admin = createSupabaseAdminClient();
  const results: FulfillmentResult[] = [];

  const { data: order } = await admin
    .from('orders')
    .select('meta')
    .eq('id', orderId)
    .single();

  const orderMeta = (order?.meta as Record<string, unknown>) || {};
  if (orderMeta.fulfilled_at) {
    console.log(`[fulfillment] Order ${orderId} already fulfilled at ${orderMeta.fulfilled_at}, skipping`);
    return results;
  }

  const { data: orderItems, error: itemsErr } = await admin
    .from('order_items')
    .select('id, product_id, quantity, meta')
    .eq('order_id', orderId);

  if (itemsErr || !orderItems || orderItems.length === 0) {
    console.error('[fulfillment] Failed to load order items:', itemsErr?.message);
    return results;
  }

  const productIds = orderItems.map(i => i.product_id);
  const { data: products } = await admin
    .from('products')
    .select('id, name, product_type, meta')
    .in('id', productIds);

  const productMap = new Map((products || []).map(p => [p.id, p]));

  for (const item of orderItems) {
    const product = productMap.get(item.product_id);
    if (!product) {
      results.push({ success: false, product_type: 'unknown', product_id: item.product_id, details: {}, error: 'product_not_found' });
      continue;
    }

    try {
      const productObj = {
        id: product.id,
        name: product.name,
        product_type: product.product_type,
        meta: (product.meta as Record<string, unknown> | null) || null,
      };
      const itemObj = {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        meta: (item.meta as Record<string, unknown> | null) || null,
      };
      const result = await fulfillItem(admin, productObj, itemObj, userId, orderId);
      results.push(result);
    } catch (err) {
      console.error(`[fulfillment] Error fulfilling product ${product.id}:`, err);
      results.push({
        success: false,
        product_type: product.product_type,
        product_id: product.id,
        details: {},
        error: err instanceof Error ? err.message : 'fulfillment_error',
      });
    }
  }

  const allMeta = results.reduce((acc, r) => {
    acc[`fulfillment_${r.product_id}`] = { success: r.success, type: r.product_type, details: r.details, error: r.error } as unknown as Json;
    return acc;
  }, {} as Record<string, Json | undefined>);

  const { data: latestOrder } = await admin.from('orders').select('meta').eq('id', orderId).single();
  const existingMeta = (latestOrder?.meta as Record<string, Json | undefined>) || {};
  await admin.from('orders').update({
    meta: { ...existingMeta, ...allMeta, fulfilled_at: new Date().toISOString() } as unknown as Json,
  }).eq('id', orderId);

  return results;
}

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  meta: Record<string, unknown> | null;
}

interface Product {
  id: number;
  name: string;
  product_type: string;
  meta: Record<string, unknown> | null;
}

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

async function fulfillItem(
  admin: AdminClient,
  product: Product,
  item: OrderItem,
  userId: string,
  orderId: number,
): Promise<FulfillmentResult> {
  switch (product.product_type) {
    case 'vps_droplet':
      return fulfillVpsDroplet(admin, product, item, userId, orderId);
    case 'digital':
    case 'template':
    case 'course':
      return fulfillStockProduct(admin, product, item, userId);
    default:
      return fulfillStockProduct(admin, product, item, userId);
  }
}

async function fulfillVpsDroplet(
  admin: AdminClient,
  product: Product,
  item: OrderItem,
  userId: string,
  orderId: number,
): Promise<FulfillmentResult> {
  const itemMeta = (item.meta || {}) as Record<string, unknown>;
  const selectedStockId = itemMeta.selected_stock_id as number | undefined;

  if (!selectedStockId) {
    return { success: false, product_type: 'vps_droplet', product_id: product.id, details: {}, error: 'no_size_selected' };
  }

  const { data: stockItem } = await admin
    .from('product_stock_items')
    .select('*')
    .eq('id', selectedStockId)
    .eq('product_id', product.id)
    .eq('status', 'enabled')
    .single();

  if (!stockItem) {
    return { success: false, product_type: 'vps_droplet', product_id: product.id, details: {}, error: 'stock_item_not_found_or_disabled' };
  }

  const cred = stockItem.credential_data as Record<string, unknown>;
  const sizeSlug = cred.slug as string;
  const doAvailable = cred.available as boolean;

  if (!sizeSlug) {
    return { success: false, product_type: 'vps_droplet', product_id: product.id, details: {}, error: 'no_size_slug' };
  }

  if (!doAvailable) {
    return { success: false, product_type: 'vps_droplet', product_id: product.id, details: {}, error: 'size_not_available' };
  }

  const productMeta = (product.meta || {}) as Record<string, unknown>;
  const typeFields = (productMeta.type_fields || {}) as Record<string, string>;
  const region = (itemMeta.selected_region as string) || typeFields.datacenter || 'sgp1';
  const image = (itemMeta.selected_image as string) || typeFields.operating_system || 'ubuntu-24-04-x64';

  const dropletName = `digitalloka-${orderId}-${userId.slice(0, 8)}`;

  const droplet = await createDroplet({
    name: dropletName,
    region: region.toLowerCase(),
    size: sizeSlug,
    image: image,
    tags: ['digitalloka', `order-${orderId}`, `user-${userId.slice(0, 8)}`],
    monitoring: true,
    ipv6: true,
  });

  const { data: user } = await admin.from('users').select('droplet_ids').eq('id', userId).single();
  const currentIds = (user?.droplet_ids || []) as number[];
  await admin.from('users').update({
    droplet_ids: [...currentIds, droplet.id],
  }).eq('id', userId);

  await admin.from('entitlements')
    .update({
      meta: {
        source_order_id: orderId,
        droplet_id: droplet.id,
        droplet_name: dropletName,
        size_slug: sizeSlug,
        region: region,
        image: image,
      } as unknown as Json,
    })
    .eq('order_item_id', item.id)
    .eq('user_id', userId);

  return {
    success: true,
    product_type: 'vps_droplet',
    product_id: product.id,
    details: {
      droplet_id: droplet.id,
      droplet_name: dropletName,
      size_slug: sizeSlug,
      region: region,
      image: image,
      status: droplet.status,
    },
  };
}

async function fulfillStockProduct(
  admin: AdminClient,
  product: Product,
  item: OrderItem,
  userId: string,
): Promise<FulfillmentResult> {
  const { count: stockCount } = await admin
    .from('product_stock_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', product.id);

  if (!stockCount || stockCount === 0) {
    return { success: true, product_type: product.product_type, product_id: product.id, details: { note: 'no_stock_configured' } };
  }

  const itemMeta = (item.meta || {}) as Record<string, unknown>;
  const selectedStockId = itemMeta.selected_stock_id as number | undefined;

  const { data: assignResult, error: assignErr } = await admin.rpc('assign_stock_item_atomic', {
    p_product_id: product.id,
    p_order_item_id: item.id,
    p_user_id: userId,
    p_stock_item_id: selectedStockId || null,
  });

  if (assignErr) {
    console.error(`[fulfillment] Stock assignment RPC error for product ${product.id}:`, assignErr.message);
    return { success: false, product_type: product.product_type, product_id: product.id, details: {}, error: assignErr.message };
  }

  const result = (assignResult as unknown) as Record<string, unknown>;
  if (!result.success) {
    return { success: false, product_type: product.product_type, product_id: product.id, details: {}, error: result.error as string };
  }

  await admin.from('entitlements')
    .update({
      meta: {
        stock_item_id: result.stock_item_id,
        is_unlimited: result.is_unlimited,
      } as unknown as Json,
    })
    .eq('order_item_id', item.id)
    .eq('user_id', userId);

  return {
    success: true,
    product_type: product.product_type,
    product_id: product.id,
    details: {
      stock_item_id: result.stock_item_id,
      is_unlimited: result.is_unlimited,
      credential_data: result.credential_data,
    },
  };
}
