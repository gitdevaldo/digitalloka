'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { useWishlist } from '@/context/wishlist-context';
import { useCart } from '@/context/cart-context';
import { LoginDialog } from '@/components/ui/login-dialog';
import { FloatingBar } from '@/components/layout/floating-bar';
import { Heart, ShoppingCart } from 'lucide-react';
import { ProviderLogo } from '@/components/ui/provider-logo';
import { sanitizeHtml } from '@/lib/sanitize-html';
import type { VpsConfig } from '@/context/cart-context';

export interface ProductData {
  id: number;
  name: string;
  slug: string;
  product_type: string;
  status: string;
  short_description: string | null;
  description: string | null;
  rating: number | null;
  reviews_count: number | null;
  category: { name: string; slug: string } | null;
  price_amount: number | null;
  price_currency: string;
  price_billing_period: string | null;
  featured: { label: string; value: string; sub?: string }[] | null;
  faq_items: { question: string; answer: string }[] | null;
  tags: string[] | null;
}

interface VpsSize {
  stock_id: number;
  slug: string;
  description: string;
  memory: number;
  vcpus: number;
  disk: number;
  transfer: number;
  price_monthly: number;
  cost_price: number;
  price_hourly: number;
  available: boolean;
  regions: string[];
  provider: string;
}

interface ProviderRegion {
  slug: string;
  name: string;
  available: boolean;
  data: { features?: string[]; sizes?: string[] };
}

interface ProviderImage {
  slug: string;
  name: string;
  available: boolean;
  data: { distribution?: string; regions?: string[]; min_disk_size?: number };
}

const REGION_FLAG_MAP: Record<string, string> = {
  nyc: '🇺🇸', sfo: '🇺🇸', tor: '🇨🇦', lon: '🇬🇧', ams: '🇳🇱',
  fra: '🇩🇪', sgp: '🇸🇬', blr: '🇮🇳', syd: '🇦🇺',
};

const DISTRO_ICONS: Record<string, string> = {
  Ubuntu: '🐧', Debian: '🌀', 'Rocky Linux': '🏔️', CentOS: '🔴',
  Fedora: '🎩', 'Arch Linux': '🔵', AlmaLinux: '🟢', FreeBSD: '😈',
};

function getRegionFlag(slug: string): string {
  const prefix = slug.replace(/[0-9]/g, '');
  return REGION_FLAG_MAP[prefix] || '🌍';
}

function getDistroIcon(distribution: string): string {
  return DISTRO_ICONS[distribution] || '💿';
}

function formatMemory(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`;
  return `${mb} MB`;
}

function VpsConfigurator({
  sizes,
  allRegions,
  allImages,
  loading,
  currency,
  onConfigChange,
}: {
  sizes: VpsSize[];
  allRegions: ProviderRegion[];
  allImages: ProviderImage[];
  loading: boolean;
  currency: string;
  onConfigChange: (config: { provider: string; region: string; regionName: string; size: VpsSize; os: string; osName: string } | null) => void;
}) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [selectedOs, setSelectedOs] = useState<string | null>(null);

  const providers = useMemo(() => {
    const providerSet = new Set<string>();
    sizes.forEach(s => providerSet.add(s.provider));
    return Array.from(providerSet);
  }, [sizes]);

  useEffect(() => {
    if (providers.length === 1 && !selectedProvider) {
      setSelectedProvider(providers[0]);
    }
  }, [providers, selectedProvider]);

  const sizesForProvider = useMemo(() => {
    if (!selectedProvider) return [];
    return sizes.filter(s => s.provider === selectedProvider);
  }, [sizes, selectedProvider]);

  const regions = useMemo(() => {
    const regionSlugsFromSizes = new Set<string>();
    sizesForProvider.forEach(s => s.regions.forEach(r => regionSlugsFromSizes.add(r)));

    if (allRegions.length > 0) {
      return allRegions
        .filter(r => regionSlugsFromSizes.has(r.slug))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    return Array.from(regionSlugsFromSizes)
      .map(slug => ({ slug, name: slug.toUpperCase(), available: true, data: {} }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sizesForProvider, allRegions]);

  const sizesForRegion = useMemo(() => {
    if (!selectedRegion) return [];
    return sizesForProvider.filter(s => s.regions.includes(selectedRegion));
  }, [sizesForProvider, selectedRegion]);

  const selectedSize = useMemo(() => {
    return sizesForRegion.find(s => s.stock_id === selectedSizeId) || null;
  }, [sizesForRegion, selectedSizeId]);

  const osImages = useMemo(() => {
    if (!selectedRegion) return [];
    if (allImages.length > 0) {
      return allImages.filter(img => {
        const imgRegions = img.data?.regions || [];
        return imgRegions.length === 0 || imgRegions.includes(selectedRegion);
      });
    }
    return [];
  }, [allImages, selectedRegion]);

  useEffect(() => {
    if (selectedProvider && selectedRegion && selectedSize && selectedOs) {
      const regionObj = regions.find(r => r.slug === selectedRegion);
      const regionName = regionObj ? regionObj.name : selectedRegion.toUpperCase();
      const osObj = osImages.find(o => o.slug === selectedOs);
      const osName = osObj ? osObj.name : selectedOs;
      onConfigChange({
        provider: selectedProvider,
        region: selectedRegion,
        regionName,
        size: selectedSize,
        os: selectedOs,
        osName,
      });
    } else {
      onConfigChange(null);
    }
  }, [selectedProvider, selectedRegion, selectedSize, selectedOs]);

  const handleProviderSelect = (p: string) => {
    setSelectedProvider(p);
    setSelectedRegion(null);
    setSelectedSizeId(null);
    setSelectedOs(null);
  };

  const handleRegionSelect = (r: string) => {
    setSelectedRegion(r);
    setSelectedSizeId(null);
    setSelectedOs(null);
  };

  if (loading) {
    return (
      <section className="features-section">
        <div className="section-hd">
          <div className="section-title">Configure your server</div>
          <div className="section-sub">Loading available options...</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="details-card" style={{ height: '100px' }}>
              <div className="h-full bg-muted rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (sizes.length === 0) {
    return (
      <section className="features-section">
        <div className="section-hd">
          <div className="section-title">Configure your server</div>
          <div className="section-sub">No sizes available at the moment</div>
        </div>
      </section>
    );
  }

  const currentStep = !selectedProvider ? 1 : !selectedRegion ? 2 : !selectedSize ? 3 : !selectedOs ? 4 : 5;

  return (
    <section className="features-section">
      <div className="section-hd">
        <div className="section-title">Configure your server</div>
        <div className="section-sub">Choose your provider, region, and server specifications</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="details-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: selectedProvider ? 'var(--accent)' : 'var(--muted)',
              color: selectedProvider ? '#fff' : 'var(--muted-foreground)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 800, border: '2px solid var(--border)',
            }}>1</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Provider
            </div>
            {selectedProvider && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', marginLeft: 'auto' }}>
                {selectedProvider}
              </span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            {providers.map(p => (
              <div
                key={p}
                onClick={() => handleProviderSelect(p)}
                className="vps-config-card"
                data-selected={selectedProvider === p}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ProviderLogo provider={p} size={24} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{p}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>
                      {sizes.filter(s => s.provider === p).length} sizes available
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedProvider && (
          <div className="details-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: selectedRegion ? 'var(--accent)' : 'var(--muted)',
                color: selectedRegion ? '#fff' : 'var(--muted-foreground)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 800, border: '2px solid var(--border)',
              }}>2</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Region
              </div>
              {selectedRegion && (() => {
                const regionObj = regions.find(r => r.slug === selectedRegion);
                return (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', marginLeft: 'auto' }}>
                    {getRegionFlag(selectedRegion)} {regionObj?.name || selectedRegion}
                  </span>
                );
              })()}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {regions.map(r => (
                <div
                  key={r.slug}
                  onClick={() => handleRegionSelect(r.slug)}
                  className="vps-config-card"
                  data-selected={selectedRegion === r.slug}
                >
                  <div style={{ fontSize: '1rem', marginBottom: '2px' }}>{getRegionFlag(r.slug)}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{r.slug.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedRegion && (
          <div className="details-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: selectedSize ? 'var(--accent)' : 'var(--muted)',
                color: selectedSize ? '#fff' : 'var(--muted-foreground)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 800, border: '2px solid var(--border)',
              }}>3</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Server Spec
              </div>
              {selectedSize && (
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', marginLeft: 'auto' }}>
                  {selectedSize.vcpus} vCPU · {formatMemory(selectedSize.memory)} · {selectedSize.disk} GB
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sizesForRegion.map(size => (
                <div
                  key={size.stock_id}
                  onClick={() => setSelectedSizeId(size.stock_id)}
                  className="vps-config-card vps-spec-row"
                  data-selected={selectedSizeId === size.stock_id}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace' }}>{size.slug}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)' }}>
                      {size.vcpus} vCPU · {formatMemory(size.memory)} RAM · {size.disk} GB SSD · {size.transfer} TB Transfer
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    {formatCurrency(size.price_monthly, currency)}
                    <span style={{ fontSize: '0.65rem', fontWeight: 500, opacity: 0.7 }}>/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSize && (
          <div className="details-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: selectedOs ? 'var(--accent)' : 'var(--muted)',
                color: selectedOs ? '#fff' : 'var(--muted-foreground)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 800, border: '2px solid var(--border)',
              }}>4</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Operating System
              </div>
              {selectedOs && (() => {
                const osObj = osImages.find(o => o.slug === selectedOs);
                return (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', marginLeft: 'auto' }}>
                    {osObj?.name || selectedOs}
                  </span>
                );
              })()}
            </div>
            {osImages.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                {osImages.map(img => {
                  const distro = img.data?.distribution || '';
                  return (
                    <div
                      key={img.slug}
                      onClick={() => setSelectedOs(img.slug)}
                      className="vps-config-card"
                      data-selected={selectedOs === img.slug}
                    >
                      <div style={{ fontSize: '1.1rem', marginBottom: '2px' }}>{getDistroIcon(distro)}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{img.name}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{img.slug}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', padding: '12px 0' }}>
                No OS images synced yet. Please sync provider data from the admin panel.
              </div>
            )}
          </div>
        )}

        {currentStep < 5 && (
          <div style={{
            textAlign: 'center', padding: '16px', fontSize: '0.78rem',
            color: 'var(--muted-foreground)', fontWeight: 600,
          }}>
            {currentStep === 1 && 'Select a provider to continue'}
            {currentStep === 2 && 'Select a region to continue'}
            {currentStep === 3 && 'Select a server spec to continue'}
            {currentStep === 4 && 'Select an operating system to continue'}
          </div>
        )}
      </div>
    </section>
  );
}

export default function ProductDetailClient({ product }: { product: ProductData }) {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem: addToCart, isInCart: checkInCart } = useCart();
  const wishlisted = isInWishlist(product.id);
  const isInCart = checkInCart(product.id);

  const [vpsSizes, setVpsSizes] = useState<VpsSize[]>([]);
  const [vpsRegions, setVpsRegions] = useState<ProviderRegion[]>([]);
  const [vpsImages, setVpsImages] = useState<ProviderImage[]>([]);
  const [sizesLoading, setSizesLoading] = useState(false);
  const [vpsConfig, setVpsConfig] = useState<{ provider: string; region: string; regionName: string; size: VpsSize; os: string; osName: string } | null>(null);

  const isDroplet = product.product_type === 'vps_droplet';
  const sanitizedDescription = useMemo(() => product.description ? sanitizeHtml(product.description) : '', [product.description]);

  useEffect(() => {
    if (!isDroplet) return;
    setSizesLoading(true);
    Promise.all([
      fetch(`/api/products/${product.slug}/sizes`).then(r => r.json()),
      fetch(`/api/products/${product.slug}/regions`).then(r => r.json()),
      fetch(`/api/products/${product.slug}/images`).then(r => r.json()),
    ])
      .then(([sizesRes, regionsRes, imagesRes]) => {
        setVpsSizes(sizesRes.data || []);
        setVpsRegions(regionsRes.data || []);
        setVpsImages(imagesRes.data || []);
      })
      .catch(() => {})
      .finally(() => setSizesLoading(false));
  }, [isDroplet, product.slug]);

  const handleWishlist = async () => {
    const result = await toggleWishlist(product.id);
    if (result === 'login_required') {
      setShowLoginDialog(true);
    }
  };

  const buildVpsCartConfig = (): VpsConfig | undefined => {
    if (!vpsConfig) return undefined;
    return {
      provider: vpsConfig.provider,
      region: vpsConfig.region,
      regionName: vpsConfig.regionName,
      sizeSlug: vpsConfig.size.slug,
      stockId: vpsConfig.size.stock_id,
      vcpus: vpsConfig.size.vcpus,
      memory: vpsConfig.size.memory,
      disk: vpsConfig.size.disk,
      transfer: vpsConfig.size.transfer,
      priceMonthly: vpsConfig.size.price_monthly,
      os: vpsConfig.os,
      osName: vpsConfig.osName,
    };
  };

  const handleAddToCart = () => {
    if (isDroplet) {
      if (!vpsConfig) return;
      const config = buildVpsCartConfig()!;
      addToCart(product.id, 1, {
        selectedStockId: vpsConfig.size.stock_id,
        selectedRegion: vpsConfig.region,
        selectedImage: vpsConfig.os,
        vpsConfig: config,
      });
    } else {
      if (!isInCart) addToCart(product.id);
    }
  };

  const handleBuyNow = () => {
    if (isDroplet) {
      if (!vpsConfig) return;
      const config = buildVpsCartConfig()!;
      addToCart(product.id, 1, {
        selectedStockId: vpsConfig.size.stock_id,
        selectedRegion: vpsConfig.region,
        selectedImage: vpsConfig.os,
        vpsConfig: config,
      });
    } else {
      addToCart(product.id);
    }
    router.push('/cart');
  };

  const featured = product.featured || [];
  const faqItems = product.faq_items || [];
  const categoryName = product.category?.name || product.product_type || 'Product';
  const currency = product.price_currency || 'IDR';
  const amount = isDroplet && vpsConfig ? vpsConfig.size.price_monthly : (product.price_amount || 0);
  const formattedAmount = formatCurrency(amount, currency);
  const billingPeriod = isDroplet ? 'monthly' : (product.price_billing_period || 'one-time');

  const vpsConfigComplete = isDroplet && vpsConfig !== null;

  function toggleFaq(index: number) {
    setOpenFaq(openFaq === index ? null : index);
  }

  return (
    <div className="page">

      <section className="pdp-hero">
        <div className="hero-left">
          <div className="breadcrumb">
            <a href="/">Home</a><span className="sep">/</span>
            <a href="/">{isDroplet ? 'VPS' : categoryName}</a><span className="sep">/</span>
            <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{product.name}</span>
          </div>

          <div className="hero-badge-row">
            <span className="badge b-green"><span className="dot"></span>{product.status}</span>
            <span className="badge b-accent"><span className="dot"></span>{isDroplet ? '🖥️ VPS Account' : categoryName}</span>
            {isDroplet && <span className="badge b-amber"><span className="dot"></span>🔥 Most popular</span>}
          </div>

          <h1 className="hero-title">
            {isDroplet ? (
              <>Your cloud server,<br/>ready in <span className="hl">60 seconds.</span></>
            ) : (
              <>{product.name}<br/><span className="hl">ready now.</span></>
            )}
          </h1>

          <p className="hero-tagline">{product.short_description}</p>

          {featured.length > 0 && (
            <div className="spec-grid">
              {featured.slice(0, 4).map((item, i) => (
                <div className="spec-cell" key={i} style={i === 3 ? { borderRight: 'none' } : undefined}>
                  <div className="spec-label">{item.label}</div>
                  <div className="spec-value">{item.value}</div>
                  {item.sub && <div className="spec-sub">{item.sub}</div>}
                </div>
              ))}
            </div>
          )}

          {isDroplet && (
            <div className="status-row">
              <span className="badge b-green" style={{ fontSize: '0.68rem' }}><span className="dot led-pulse"></span>99.99% uptime SLA</span>
              <div className="uptime-bar"><div className="uptime-fill" style={{ width: '99.9%' }}></div></div>
              <span className="uptime-label">Last 90 days</span>
            </div>
          )}

          <div className="includes-title">{isDroplet ? 'What you get with your account' : 'What you get with your purchase'}</div>
          <div className="checklist">
            {(isDroplet ? [
              'Dedicated public IPv4 address — yours for the subscription lifetime',
              'Root SSH access + web-based terminal in the dashboard',
              'Choice of OS: Ubuntu 24.04, Debian 12, or Rocky Linux 9',
              'One-click Power On / Off / Reboot from your dashboard',
              'Private network and firewall rules included',
              'Weekly automated snapshots — restore in one click',
              '24/7 infrastructure monitoring with email alerts',
            ] : [
              'Instant delivery after checkout — access from your dashboard immediately',
              'Clear ownership and entitlement tracking in your account',
              'Status and renewal information always visible',
              'Secure credential handling and storage',
              'Customer support included for product lifecycle',
            ]).map((text, i) => (
              <div className="check-item" key={i}>
                <span className="check-mark"></span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="purchase-card">
          {isDroplet && (
            <div className="card-visual">
              <div className="server-stack">
                <div className="server-rack">
                  <div className="rack-led led-pulse" style={{ background: 'var(--quaternary)' }}></div>
                  <div className="rack-bars">
                    <div className="rack-bar" style={{ flex: 3, background: 'var(--accent)' }}></div>
                    <div className="rack-bar" style={{ flex: 2, background: 'var(--quaternary)' }}></div>
                    <div className="rack-bar" style={{ flex: 1 }}></div>
                  </div>
                  <div className="rack-label">cpu</div>
                  <div className="rack-status-chip" style={{ background: 'var(--quaternary)' }}>Active</div>
                </div>
                <div className="server-rack">
                  <div className="rack-led" style={{ background: 'var(--tertiary)' }}></div>
                  <div className="rack-bars">
                    <div className="rack-bar" style={{ flex: 2, background: 'var(--tertiary)' }}></div>
                    <div className="rack-bar" style={{ flex: 4 }}></div>
                  </div>
                  <div className="rack-label">mem</div>
                  <div className="rack-status-chip" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>48%</div>
                </div>
                <div className="server-rack">
                  <div className="rack-led" style={{ background: 'var(--accent)' }}></div>
                  <div className="rack-bars">
                    <div className="rack-bar" style={{ flex: 1, background: 'var(--accent)' }}></div>
                    <div className="rack-bar" style={{ flex: 5 }}></div>
                  </div>
                  <div className="rack-label">disk</div>
                  <div className="rack-status-chip" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>12%</div>
                </div>
              </div>
            </div>
          )}

          <div className="card-body-pdp">
            {isDroplet && vpsConfig && (
              <div style={{
                padding: '10px 14px', marginBottom: '12px',
                background: 'rgba(139,92,246,0.06)', borderRadius: 'var(--r-md)',
                border: '2px solid var(--accent)', fontSize: '0.72rem',
              }}>
                <div style={{ fontWeight: 800, marginBottom: '6px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.65rem' }}>Your configuration</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', color: 'var(--foreground)' }}>
                  <div><span style={{ fontWeight: 600, color: 'var(--muted-foreground)' }}>Provider:</span> {vpsConfig.provider}</div>
                  <div><span style={{ fontWeight: 600, color: 'var(--muted-foreground)' }}>Region:</span> {vpsConfig.regionName}</div>
                  <div><span style={{ fontWeight: 600, color: 'var(--muted-foreground)' }}>Spec:</span> {vpsConfig.size.vcpus} vCPU · {formatMemory(vpsConfig.size.memory)} · {vpsConfig.size.disk} GB</div>
                  <div><span style={{ fontWeight: 600, color: 'var(--muted-foreground)' }}>OS:</span> {vpsConfig.osName || vpsConfig.os}</div>
                </div>
              </div>
            )}

            <div className="price-area">
              <div className="price-from">{isDroplet ? (vpsConfig ? 'Your price' : 'Starting from') : 'Price'}</div>
              <div className="price-row-pdp">
                <div className="price-main-pdp">{formattedAmount}</div>
                <div className="price-period">/ {billingPeriod}</div>
              </div>
            </div>

            <div className="card-cta-stack">
              {isDroplet ? (
                <>
                  <button
                    className="btn btn-accent btn-lg btn-full"
                    onClick={handleBuyNow}
                    disabled={!vpsConfigComplete}
                    style={!vpsConfigComplete ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    Buy Now
                  </button>
                  <button
                    className={`btn btn-full${isInCart ? ' btn-ghost' : ''}`}
                    onClick={handleAddToCart}
                    disabled={!vpsConfigComplete || isInCart}
                    style={(!vpsConfigComplete || isInCart) ? { opacity: isInCart ? 0.6 : 0.5, cursor: isInCart ? 'default' : 'not-allowed' } : {}}
                  >
                    {isInCart ? 'Already in Cart' : 'Add to Cart'}
                  </button>
                  <button className="btn btn-ghost btn-full" onClick={handleWishlist}>
                    {wishlisted ? '❤️ In Wishlist' : 'Add to wishlist'}
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-accent btn-lg btn-full" onClick={handleBuyNow}>Buy Now</button>
                  <button
                    className={`btn btn-full${isInCart ? ' btn-ghost' : ''}`}
                    onClick={() => { if (!isInCart) addToCart(product.id); }}
                    disabled={isInCart}
                    style={isInCart ? { opacity: 0.6, cursor: 'default' } : {}}
                  >
                    {isInCart ? 'Already in Cart' : 'Add to Cart'}
                  </button>
                  <button className="btn btn-ghost btn-full" onClick={handleWishlist}>
                    {wishlisted ? '❤️ In Wishlist' : 'Add to wishlist'}
                  </button>
                  <a className="btn btn-ghost btn-full" href="/" style={{ fontSize: '0.78rem' }}>Back to catalog</a>
                </>
              )}
            </div>

            <div className="card-specs">
              <div className="card-spec-row"><span className="cs-key">Setup time</span><span className="cs-val">{isDroplet ? '~60 seconds' : 'Instant'}</span></div>
              <div className="card-spec-row"><span className="cs-key">Contract</span><span className="cs-val">No lock-in</span></div>
              {isDroplet && <div className="card-spec-row"><span className="cs-key">Access</span><span className="cs-val mono">root SSH + dashboard</span></div>}
              <div className="card-spec-row"><span className="cs-key">Renewal</span><span className="cs-val">{isDroplet ? 'Auto-renews, cancel anytime' : 'Auto-renews'}</span></div>
            </div>

            <div className="card-trust">
              <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <span>Secure checkout</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">⚡</span>
                <span>Instant delivery</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">💬</span>
                <span>Customer support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isDroplet && (
        <>
          <div className="divider"></div>
          <VpsConfigurator
            sizes={vpsSizes}
            allRegions={vpsRegions}
            allImages={vpsImages}
            loading={sizesLoading}
            currency={currency}
            onConfigChange={setVpsConfig}
          />
        </>
      )}

      {product.description && (
        <>
          <div className="divider"></div>
          <section className="features-section">
            <div className="section-hd">
              <div className="section-title">Product details</div>
              <div className="section-sub">Full description and specifications</div>
            </div>
            <div className="details-card">
              <div className="details-content" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
            </div>
          </section>
        </>
      )}

      {isDroplet && (
        <>
          <div className="divider"></div>
          <section className="features-section">
            <div className="section-hd">
              <div className="section-title">Everything in your account</div>
              <div className="section-sub">Managed for you — you just build on top of it</div>
            </div>
            <div className="features-grid">
              {[
                { icon: '⚡', title: 'Instant provisioning', desc: 'Server spins up in under 60 seconds after checkout. Credentials delivered to your email and dashboard immediately.', color: 'rgba(139,92,246,0.1)' },
                { icon: '🖥️', title: 'Full control dashboard', desc: 'Power on, off, reboot, rebuild OS, resize — all from your DigitalLoka account dashboard. No SSH required for management.', color: 'rgba(52,211,153,0.12)' },
                { icon: '🔑', title: 'Root SSH + web terminal', desc: 'Full root access over SSH with your own key pair. Plus a browser-based web terminal for quick commands without a local client.', color: 'rgba(251,191,36,0.15)' },
                { icon: '📸', title: 'Snapshots & backups', desc: 'Weekly automated snapshots included. Restore your server state in one click. Manual snapshots available on demand anytime.', color: 'rgba(244,114,182,0.12)' },
                { icon: '🌐', title: 'Private networking', desc: 'Connect multiple servers on an internal VLAN. Zero-cost private traffic between your servers within the same region.', color: 'rgba(139,92,246,0.1)' },
                { icon: '📊', title: 'Live monitoring', desc: 'CPU, RAM, disk, and bandwidth usage charts in real time. Set alert thresholds and get email notifications before you hit limits.', color: 'rgba(52,211,153,0.12)' },
              ].map((f) => (
                <div className="feature-card" key={f.title}>
                  <div className="feat-icon" style={{ background: f.color }}>{f.icon}</div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="divider"></div>
          <section className="setup-section">
            <div className="section-hd">
              <div className="section-title">Up and running in 4 steps</div>
              <div className="section-sub">From checkout to a live server — under 5 minutes</div>
            </div>
            <div className="timeline">
              {[
                { n: '1', title: 'Configure your server', desc: 'Pick provider, region, spec, and OS right here on the product page.', bg: 'rgba(139,92,246,0.1)' },
                { n: '2', title: 'Complete checkout', desc: 'Pay securely. Your account and server entitlement is created instantly.', bg: 'rgba(251,191,36,0.15)' },
                { n: '3', title: 'Server provisioned', desc: 'Your VPS spins up in ~60s. OS, IP, and SSH credentials ready in your dashboard.', bg: 'rgba(52,211,153,0.12)' },
                { n: '4', title: 'Start building', desc: 'SSH in or use the web terminal. Full root access from the moment you log in.', bg: 'rgba(244,114,182,0.12)' },
              ].map((s) => (
                <div className="timeline-step" key={s.n}>
                  <div className="step-circle" style={{ background: s.bg }}>{s.n}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="divider"></div>
          <section className="reviews-section">
            <div className="section-hd" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div className="section-title">What customers say</div>
                <div className="section-sub"><span style={{ fontFamily: 'var(--font-h)', fontWeight: 900, color: 'var(--foreground)' }}>{(product.rating || 4.8).toFixed(1)}</span> out of 5 · {product.reviews_count || 184} verified reviews</div>
              </div>
              <button className="btn btn-ghost btn-sm">Write a review</button>
            </div>
            <div className="reviews-grid">
              {[
                { initials: 'BI', name: 'Budi I.', date: 'Apr 1, 2026', text: "Server was live in literally 50 seconds. I've used 4 different VPS providers — the dashboard here is the cleanest by far.", plan: product.name, gradient: 'linear-gradient(135deg,var(--accent),var(--secondary))' },
                { initials: 'DS', name: 'Dewi S.', date: 'Mar 20, 2026', text: "Finally a VPS that's not just sold as a raw droplet. Having the full dashboard in my account page, with power controls and monitoring charts, means my clients can self-serve.", plan: 'Business', gradient: 'linear-gradient(135deg,var(--quaternary),var(--accent))' },
                { initials: 'RH', name: 'Rafi H.', date: 'Mar 8, 2026', text: 'Migrated from another provider — zero downtime, IP transferred same day. SGP1 latency from Jakarta is consistently under 8ms.', plan: product.name, gradient: 'linear-gradient(135deg,var(--tertiary),var(--secondary))' },
              ].map((r) => (
                <div className="review-card" key={r.initials}>
                  <div className="review-top">
                    <div className="review-avatar" style={{ background: r.gradient }}>{r.initials}</div>
                    <div><div className="review-name">{r.name}</div><div className="review-date">{r.date}</div></div>
                  </div>
                  <div className="review-stars">{'★★★★★'.split('').map((s, i) => <div className="rev-star" key={i}>{s}</div>)}</div>
                  <div className="review-text">{r.text}</div>
                  <div className="review-plan">📦 {r.plan} plan</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="divider"></div>
      <section className="faq-section">
        <div className="section-hd">
          <div className="section-title">Frequently asked questions</div>
          <div className="section-sub">{isDroplet ? 'Common questions about VPS hosting' : 'Common questions about this product'}</div>
        </div>
        <div className="faq-grid">
          {(faqItems.length > 0 ? faqItems : [
            { question: 'How do I access my product after purchase?', answer: 'After completing checkout, your product will appear immediately in your DigitalLoka dashboard under "My Products". All credentials and access information will be available there.' },
            { question: 'What payment methods are accepted?', answer: 'We accept various payment methods including credit cards, bank transfers, and digital wallets. All payments are processed securely through our payment partner.' },
            { question: 'Can I get a refund?', answer: 'Refund policies vary by product type. For most digital products, we offer support to resolve any issues. Contact our support team for specific refund inquiries.' },
            { question: 'How do renewals work?', answer: 'Depending on the product billing period, renewals are processed automatically. You can manage auto-renewal settings and view upcoming renewal dates in your dashboard.' },
          ]).map((faq, i) => (
            <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={i}>
              <div className="faq-question" onClick={() => toggleFaq(i)}>
                {faq.question}
                <div className="faq-chevron">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              <div className="faq-answer"><div className="faq-answer-inner">{faq.answer}</div></div>
            </div>
          ))}
        </div>
      </section>

      <FloatingBar>
        <div className="floating-bar-info">
          <span className="floating-bar-name">{product.name}</span>
          <span className="floating-bar-price">{formattedAmount} <span style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.7 }}>/ {billingPeriod}</span></span>
        </div>
        <div className="floating-bar-divider" />
        <button className="floating-bar-btn" onClick={handleWishlist}>
          <Heart size={16} fill={wishlisted ? 'var(--secondary)' : 'none'} color={wishlisted ? 'var(--secondary)' : 'currentColor'} />
          <span>{wishlisted ? 'Saved' : 'Wishlist'}</span>
        </button>
        <button
          className="floating-bar-btn accent"
          onClick={handleBuyNow}
          disabled={isDroplet && !vpsConfigComplete}
          style={isDroplet && !vpsConfigComplete ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <ShoppingCart size={16} />
          <span>Buy Now</span>
        </button>
      </FloatingBar>
      <LoginDialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
    </div>
  );
}
