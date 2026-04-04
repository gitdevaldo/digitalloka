'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';

export default function DigitalProductsPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedId, setRevealedId] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/user/products')
      .then(r => r.json())
      .then(data => {
        const digital = (data.data || []).filter((item: Record<string, unknown>) => {
          const p = item.product as Record<string, unknown> | undefined;
          const t = (p?.product_type as string) || '';
          return ['digital', 'template', 'ui-kit', 'course'].includes(t);
        });
        setProducts(digital);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => showToast('Copied!')).catch(() => showToast('Copy failed'));
  }

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader title="Digital Products" subtitle="Your purchased digital products and account credentials." />

      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : products.length === 0 ? (
        <EmptyState icon="📥" title="No digital products" description="Digital products will appear here when purchased." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {products.map(item => {
            const product = item.product as Record<string, unknown> | undefined;
            const isActive = (item.status as string) === 'active';
            const cred = item.credential_data as Record<string, string> | undefined;
            const isRevealed = revealedId === (item.id as number);

            return (
              <Panel key={item.id as number}>
                <div style={{ padding: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{(product?.name as string) || 'Unknown'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                        Purchased {item.starts_at ? new Date(item.starts_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </div>
                    </div>
                    <StatusBadge variant={item.status as string} label={item.status as string} />
                  </div>

                  {cred && Object.keys(cred).length > 0 && isActive ? (
                    <div style={{ background: 'var(--muted)', border: '2px solid var(--border)', borderRadius: '10px', padding: '14px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)' }}>
                          Account Credentials
                        </span>
                        <button
                          onClick={() => setRevealedId(isRevealed ? null : (item.id as number))}
                          style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
                        >
                          {isRevealed ? 'Hide' : 'Reveal'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(cred).map(([key, value]) => (
                          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.03em', minWidth: '90px', flexShrink: 0 }}>
                              {key}
                            </span>
                            <span
                              className="font-mono"
                              style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--foreground)', flex: 1, wordBreak: 'break-all' }}
                            >
                              {isRevealed ? String(value) : '••••••••••'}
                            </span>
                            {isRevealed && (
                              <button
                                onClick={() => copyToClipboard(String(value))}
                                style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', background: 'none', border: '1.5px solid var(--border)', borderRadius: '6px', cursor: 'pointer', padding: '3px 8px', flexShrink: 0 }}
                              >
                                Copy
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : !isActive ? (
                    <div style={{ textAlign: 'center', padding: '12px' }}>
                      <ButtonLink href="/products" size="sm" variant="warning">Renew</ButtonLink>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', padding: '8px 0' }}>
                      No credentials attached. Check your dashboard for access details.
                    </div>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
