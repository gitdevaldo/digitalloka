'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Eye, EyeOff, ExternalLink, Copy, Check, Server } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
  status: string;
  product_type: string;
}

interface StockItem {
  id: number;
  product_id: number;
  status: string;
  sold_at: string | null;
  meta: Record<string, unknown> | null;
  product: Product | null;
  credential_data: Record<string, string> | null;
}

function isLinkValue(val: string): boolean {
  return /^https?:\/\//i.test(val);
}

function CredentialSection({ item }: { item: StockItem }) {
  const [revealed, setRevealed] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const cred = item.credential_data;
  if (!cred || Object.keys(cred).length === 0) return null;

  const headers = Object.keys(cred);

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <Panel>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>Product Credentials</h3>
          <button
            onClick={() => setRevealed(!revealed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--muted)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--foreground)',
            }}
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
            {revealed ? 'Hide All' : 'Reveal All'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {headers.map((header) => {
            const value = cred[header];
            if (!value) return null;
            const isLink = isLinkValue(value);

            return (
              <div key={header}>
                <div style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--muted-foreground)',
                  marginBottom: 4,
                }}>
                  {header}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--muted)',
                  borderRadius: 'var(--r-sm)',
                  padding: '10px 14px',
                  border: '1.5px solid var(--border)',
                }}>
                  <span style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    wordBreak: 'break-all',
                    color: 'var(--foreground)',
                  }}>
                    {revealed ? value : '••••••••••••••••••••'}
                  </span>
                  {revealed && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button
                        onClick={() => handleCopy(value, header)}
                        title="Copy"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: copiedField === header ? 'var(--success)' : 'var(--muted-foreground)',
                          padding: 4,
                        }}
                      >
                        {copiedField === header ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      {isLink && (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open link"
                          style={{ color: 'var(--accent)', padding: 4, display: 'flex' }}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

function VpsSection({ item }: { item: StockItem }) {
  const meta = (item.meta as Record<string, unknown>) || {};
  const dropletId = meta.droplet_id as number | undefined;
  const dropletName = meta.droplet_name as string | undefined;
  const sizeSlug = meta.size_slug as string | undefined;
  const region = meta.region as string | undefined;
  const image = meta.image as string | undefined;

  if (!dropletId) return null;

  const fields = [
    { label: 'Droplet ID', value: String(dropletId) },
    { label: 'Name', value: dropletName || '—' },
    { label: 'Size', value: sizeSlug || '—' },
    { label: 'Region', value: region || '—' },
    { label: 'Image', value: image || '—' },
  ];

  return (
    <Panel>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Server size={16} />
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>VPS Details</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fields.map((f) => (
            <div key={f.label}>
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--muted-foreground)',
                marginBottom: 4,
              }}>
                {f.label}
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                background: 'var(--muted)',
                borderRadius: 'var(--r-sm)',
                padding: '10px 14px',
                border: '1.5px solid var(--border)',
                color: 'var(--foreground)',
              }}>
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<StockItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/user/products/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setItem(data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
        <EmptyState icon="❌" title="Product not found" description="This product doesn't exist or you don't have access to it." />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/dashboard/products" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem' }}>
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  const product = item.product;
  const isVps = product?.product_type === 'vps_droplet';
  const meta = (item.meta as Record<string, unknown>) || {};
  const hasVpsDetails = !!meta.droplet_id;
  const hasCredentials = item.credential_data && Object.keys(item.credential_data).length > 0;

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <div style={{ marginBottom: 8 }}>
        <Link
          href="/dashboard/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--muted-foreground)',
            fontSize: '0.8rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} /> Back to products
        </Link>
      </div>

      <PageHeader
        title={product?.name || 'Product'}
        subtitle={`${item.status.charAt(0).toUpperCase() + item.status.slice(1)} · Purchased ${item.sold_at ? formatDate(item.sold_at) : '—'}`}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Panel>
          <div style={{ padding: 16 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 16,
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: 4 }}>
                  Status
                </div>
                <StatusBadge variant={item.status} label={item.status} />
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: 4 }}>
                  Type
                </div>
                <span
                  className="inline-flex items-center bg-muted rounded-full text-[0.65rem] font-bold text-muted-foreground"
                  style={{ padding: '2px 8px', border: '1.5px solid var(--border)' }}
                >
                  {product?.product_type || '—'}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: 4 }}>
                  Purchased
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {item.sold_at ? formatDate(item.sold_at) : '—'}
                </span>
              </div>
            </div>
          </div>
        </Panel>

        {hasCredentials && <CredentialSection item={item} />}

        {isVps && hasVpsDetails && <VpsSection item={item} />}

        {!hasCredentials && !hasVpsDetails && (
          <Panel>
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
              No credentials or access details available for this product.
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
