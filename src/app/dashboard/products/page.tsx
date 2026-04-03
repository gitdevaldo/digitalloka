'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';

export default function UserProductsPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/products')
      .then((r) => r.json())
      .then((data) => { setProducts(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Products" subtitle="Your purchased products and entitlements." />
      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 bg-card border-2 border-border rounded-xl animate-pulse" />)}</div>
      ) : products.length === 0 ? (
        <EmptyState icon="📦" title="No purchased products" description="Products will appear here once you make a purchase." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((item) => (
            <div key={item.id as number} className="bg-card border-2 border-foreground rounded-xl p-5 shadow-pop">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-heading text-sm font-extrabold">{(item.product as Record<string, unknown>)?.name as string || 'Unknown Product'}</h3>
                <StatusBadge variant={item.status as string} label={item.status as string} />
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {item.starts_at && <>Active since {new Date(item.starts_at as string).toLocaleDateString()}</>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
