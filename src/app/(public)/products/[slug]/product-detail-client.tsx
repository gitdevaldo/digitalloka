'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { useWishlist } from '@/context/wishlist-context';
import { useCart } from '@/context/cart-context';
import { LoginDialog } from '@/components/ui/login-dialog';
import { FloatingBar } from '@/components/layout/floating-bar';
import { Heart, ShoppingCart } from 'lucide-react';

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
  price_hourly: number;
  available: boolean;
  regions: string[];
}

function formatMemory(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`;
  return `${mb} MB`;
}

export default function ProductDetailClient({ product }: { product: ProductData }) {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem: addToCart, isInCart: checkInCart } = useCart();
  const wishlisted = isInWishlist(product.id);
  const isInCart = checkInCart(product.id);

  const [vpsSizes, setVpsSizes] = useState<VpsSize[]>([]);
  const [selectedSize, setSelectedSize] = useState<VpsSize | null>(null);
  const [sizesLoading, setSizesLoading] = useState(false);

  const isDroplet = product.product_type === 'vps_droplet';

  useEffect(() => {
    if (!isDroplet) return;
    setSizesLoading(true);
    fetch(`/api/products/${product.slug}/sizes`)
      .then(r => r.json())
      .then(d => {
        const sizes = d.data || [];
        setVpsSizes(sizes);
        if (sizes.length > 0) setSelectedSize(sizes[0]);
      })
      .catch(() => {})
      .finally(() => setSizesLoading(false));
  }, [isDroplet, product.id]);

  const handleWishlist = async () => {
    const result = await toggleWishlist(product.id);
    if (result === 'login_required') {
      setShowLoginDialog(true);
    }
  };

  const handleBuyNow = () => {
    if (isDroplet && selectedSize) {
      addToCart(product.id, 1, { selectedStockId: selectedSize.stock_id });
    } else {
      addToCart(product.id);
    }
    router.push('/cart');
  };

  const featured = product.featured || [];
  const faqItems = product.faq_items || [];
  const categoryName = product.category?.name || product.product_type || 'Product';
  const currency = product.price_currency || 'IDR';
  const amount = isDroplet && selectedSize ? selectedSize.price_monthly : (product.price_amount || 0);
  const formattedAmount = isDroplet && selectedSize ? `$${selectedSize.price_monthly.toFixed(0)}` : formatCurrency(product.price_amount || 0, currency);
  const billingPeriod = product.price_billing_period || 'one-time';
  const specs = selectedSize ? {
    vcpu: String(selectedSize.vcpus),
    ram: formatMemory(selectedSize.memory),
    storage: `${selectedSize.disk} GB`,
    bandwidth: `${selectedSize.transfer} TB`,
    region: 'Singapore',
    datacenter: 'SGP1',
  } : {
    vcpu: featured.find(f => f.label.toLowerCase().includes('cpu'))?.value || '2',
    ram: featured.find(f => f.label.toLowerCase().includes('ram'))?.value || '4',
    storage: featured.find(f => f.label.toLowerCase().includes('ssd') || f.label.toLowerCase().includes('storage'))?.value || '80',
    bandwidth: featured.find(f => f.label.toLowerCase().includes('bandwidth'))?.value || '4',
    region: 'Singapore',
    datacenter: 'SGP1',
  };

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
            <>
              <div className="card-visual">
                <div className="visual-region-chip">🇸🇬 {specs.datacenter} · {specs.region}</div>
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

              {vpsSizes.length > 0 && (
                <div style={{ padding: '14px 18px 0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, marginBottom: '8px', color: 'var(--foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Choose your plan</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                    {vpsSizes.map(size => (
                      <div
                        key={size.stock_id}
                        onClick={() => setSelectedSize(size)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 'var(--r-md)',
                          border: `2px solid ${selectedSize?.stock_id === size.stock_id ? 'var(--accent)' : 'var(--border)'}`,
                          background: selectedSize?.stock_id === size.stock_id ? 'rgba(139,92,246,0.06)' : 'var(--card)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace' }}>{size.slug}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>
                            {size.vcpus} vCPU · {formatMemory(size.memory)} · {size.disk} GB · {size.transfer} TB
                          </div>
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, whiteSpace: 'nowrap' }}>${size.price_monthly}/mo</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {sizesLoading && (
                <div style={{ padding: '14px 18px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                  Loading available sizes...
                </div>
              )}

              <div style={{ padding: '18px 22px 0' }}>
                <div className="billing-toggle">
                  <div className={`billing-option ${billing === 'monthly' ? 'active' : ''}`} onClick={() => setBilling('monthly')}>Monthly</div>
                  <div className={`billing-option ${billing === 'annual' ? 'active' : ''}`} onClick={() => setBilling('annual')}>
                    Annual <span className="billing-save">–20%</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="card-body-pdp">
            <div className="price-area">
              <div className="price-from">{isDroplet ? 'Starting from' : 'Price'}</div>
              <div className="price-row-pdp">
                <div className="price-main-pdp">{formattedAmount}</div>
                <div className="price-period">/ {billingPeriod}</div>
              </div>
            </div>

            <div className="card-cta-stack">
              {isDroplet ? (
                <>
                  <button className="btn btn-accent btn-lg btn-full" onClick={handleBuyNow} disabled={!selectedSize && vpsSizes.length > 0}>🖥️ Deploy my server</button>
                  <button className="btn btn-ghost btn-full">💻 Try demo console</button>
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
                    <ShoppingCart size={16} />
                    {isInCart ? 'Already in Cart' : 'Add to Cart'}
                  </button>
                  <button className="btn btn-ghost btn-full" onClick={handleWishlist}>
                    {wishlisted ? '❤️ In Wishlist' : 'Add to wishlist'}
                  </button>
                  <a className="btn btn-ghost btn-full" href="/" style={{ fontSize: '0.78rem' }}>Back to catalog</a>
                </>
              )}
            </div>

            {isDroplet && (
              <div className="guarantee-strip">
                <span style={{ fontSize: '1.1rem' }}>🛡️</span>
                <span>7-day full refund if you&apos;re not satisfied.</span>
              </div>
            )}

            <div className="card-specs">
              <div className="card-spec-row"><span className="cs-key">Setup time</span><span className="cs-val">{isDroplet ? '~60 seconds' : 'Instant'}</span></div>
              {isDroplet && <div className="card-spec-row"><span className="cs-key">Region</span><span className="cs-val">{specs.region} ({specs.datacenter})</span></div>}
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

      {product.description && (
        <>
          <div className="divider"></div>
          <section className="features-section">
            <div className="section-hd">
              <div className="section-title">Product details</div>
              <div className="section-sub">Full description and specifications</div>
            </div>
            <div className="details-card">
              <div className="details-content" dangerouslySetInnerHTML={{ __html: product.description }} />
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
                { n: '1', title: 'Choose your plan', desc: 'Pick a plan and region. Monthly or annual billing, cancel any time.', bg: 'rgba(139,92,246,0.1)' },
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
        <button className="floating-bar-btn accent" onClick={handleBuyNow}>
          <ShoppingCart size={16} />
          <span>Buy Now</span>
        </button>
      </FloatingBar>
      <LoginDialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
    </div>
  );
}
