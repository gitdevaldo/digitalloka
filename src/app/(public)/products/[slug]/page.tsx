import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { getProductBySlug } from '@/lib/services/catalog';
import ProductDetailClient from './product-detail-client';
import type { ProductData } from './product-detail-client';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const product = await getProductBySlug(supabase, slug);

  if (!product) {
    notFound();
  }

  let availableStock: number | null = null;
  if (product.product_type !== 'vps_droplet') {
    const admin = createSupabaseAdminClient();
    const { count, error: stockError } = await admin
      .from('product_stock_items')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', product.id)
      .eq('status', 'enabled')
      .is('sold_at', null);
    if (!stockError) {
      availableStock = count ?? 0;
    }
  }

  const productData: ProductData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    product_type: product.product_type,
    status: product.status,
    short_description: product.short_description,
    description: product.description,
    rating: product.rating,
    reviews_count: product.reviews_count,
    category: product.category,
    price_amount: product.price_amount,
    price_currency: product.price_currency,
    price_billing_period: product.price_billing_period,
    featured: product.featured as ProductData['featured'],
    faq_items: product.faq_items as ProductData['faq_items'],
    tags: product.tags,
    available_stock: availableStock,
  };

  return <ProductDetailClient product={productData} />;
}
