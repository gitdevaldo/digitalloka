'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { formatCurrency } from '@/lib/utils';
import { LoginDialog } from '@/components/ui/login-dialog';

interface Product {
  id: number;
  name: string;
  slug: string;
  price_amount: number;
  price_currency: string;
  price_billing_period: string;
  category: { name: string } | null;

}

const ICON_COLORS: Record<string, string> = {
  template: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
  'ui-kit': 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
  plugin: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
  ebook: 'linear-gradient(135deg, #fef3c7, #fde68a)',
  course: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
};

const STEPS = [
  { num: 1, label: 'Cart' },
  { num: 2, label: 'Account' },
  { num: 3, label: 'Payment' },
  { num: 4, label: 'Review' },
];

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { isLoggedIn } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [currentStep, setCurrentStep] = useState(2);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    payMethod: 'card',
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setFetchError(false);
    fetch('/api/cart/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: items.map(i => i.productId) }),
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setProducts(d.data || []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [items.length]);

  const getQty = (productId: number) => items.find(i => i.productId === productId)?.quantity || 1;
  const cartProducts = products.filter(p => items.some(i => i.productId === p.id));
  const subtotal = cartProducts.reduce((sum, p) => sum + p.price_amount * getQty(p.id), 0);
  const currency = cartProducts[0]?.price_currency || 'USD';

  const advanceStep = (step: number) => {
    setCurrentStep(step + 1);
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/user/cart-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ product_id: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      setOrderNumber(data.data?.order_number || '');
      setOrderComplete(true);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="inner-wrap">
        <div className="success-page">
          <div className="success-icon-circle">&#10003;</div>
          <div className="success-title">Order Placed!</div>
          <div className="success-desc">
            Your order has been placed successfully. You will receive credentials and access details via email within 60 seconds.
          </div>
          <div className="success-details">
            <div className="sd-row">
              <span className="sd-key">Order Number</span>
              <span className="sd-val mono">{orderNumber}</span>
            </div>
            <div className="sd-row">
              <span className="sd-key">Status</span>
              <span className="sd-val">Processing</span>
            </div>
            <div className="sd-row">
              <span className="sd-key">Payment</span>
              <span className="sd-val">{formData.payMethod === 'card' ? 'Card' : formData.payMethod}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/" className="btn btn-accent">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  const getCatSlug = (p: Product) => p.category?.name?.toLowerCase().replace(/\s+/g, '-') || 'template';

  return (
    <div className="inner-wrap">
      <div className="page-header">
        <Link href="/cart" className="back-link">
          <ArrowLeft size={16} />
          Back to cart
        </Link>
        <div className="page-title">Checkout</div>
        <div className="page-sub">Complete your purchase</div>
      </div>

      {loading ? (
        <div className="inline-loader">
          <div className="spinner" />
          <span>Preparing checkout...</span>
        </div>
      ) : fetchError ? (
        <div className="empty-state">
          <div className="empty-icon">&#9888;&#65039;</div>
          <div className="empty-title">Something went wrong</div>
          <div className="empty-desc">Could not load checkout details. Please try again.</div>
          <button className="btn btn-accent" onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : cartProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#128722;</div>
          <div className="empty-title">Nothing to checkout</div>
          <div className="empty-desc">Your cart is empty. Add some products first.</div>
          <Link href="/" className="btn btn-accent">Browse Products</Link>
        </div>
      ) : (
        <>
          <div className="checkout-steps">
            {STEPS.map((step, i) => (
              <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div className={`step-connector${currentStep > step.num ? ' done' : ''}`} />}
                <div className={`checkout-step${currentStep === step.num ? ' active' : ''}${currentStep > step.num ? ' done' : ''}`}>
                  <div className="step-num">
                    {currentStep > step.num ? <Check size={12} /> : step.num}
                  </div>
                  <span className="step-label">{step.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-layout">
            <div>
              {/* Step 2: Account */}
              <div className={`form-panel${currentStep > 2 ? '' : ''}${currentStep < 2 ? ' locked' : ''}`}>
                <div className="fp-header">
                  <div className="fp-title">
                    <div className="fp-step-badge" style={currentStep > 2 ? { background: 'var(--quaternary)' } : {}}>2</div>
                    Account Details
                  </div>
                  {currentStep > 2 && (
                    <div className="fp-done-badge">
                      <Check size={14} /> Done
                    </div>
                  )}
                </div>
                {currentStep >= 2 && (
                  <div className="fp-body">
                    <div className="field-row">
                      <div className="field">
                        <div className="field-label">First Name</div>
                        <input
                          className="field-input"
                          type="text"
                          placeholder="Your first name"
                          value={formData.firstName}
                          onChange={e => setFormData(d => ({ ...d, firstName: e.target.value }))}
                          disabled={currentStep > 2}
                        />
                      </div>
                      <div className="field">
                        <div className="field-label">Last Name</div>
                        <input
                          className="field-input"
                          type="text"
                          placeholder="Your last name"
                          value={formData.lastName}
                          onChange={e => setFormData(d => ({ ...d, lastName: e.target.value }))}
                          disabled={currentStep > 2}
                        />
                      </div>
                    </div>
                    <div className="field-row single">
                      <div className="field">
                        <div className="field-label">Email Address</div>
                        <input
                          className="field-input"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                          disabled={currentStep > 2}
                        />
                      </div>
                    </div>
                    {currentStep === 2 && (
                      <div style={{ marginTop: '14px' }}>
                        <button className="btn btn-accent" onClick={() => advanceStep(2)}>
                          Continue to payment &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 3: Payment */}
              <div className={`form-panel${currentStep < 3 ? ' locked' : ''}`}>
                <div className="fp-header">
                  <div className="fp-title">
                    <div className="fp-step-badge" style={currentStep < 3 ? { background: 'var(--muted-foreground)' } : currentStep > 3 ? { background: 'var(--quaternary)' } : {}}>3</div>
                    Payment
                  </div>
                  {currentStep > 3 && (
                    <div className="fp-done-badge">
                      <Check size={14} /> Done
                    </div>
                  )}
                </div>
                {currentStep >= 3 && (
                  <div className="fp-body">
                    <div className="pay-tabs">
                      {[
                        { key: 'card', icon: '&#128179;', label: 'Card' },
                        { key: 'bank', icon: '&#127974;', label: 'Bank Transfer' },
                        { key: 'qris', icon: '&#128241;', label: 'QRIS / GoPay' },
                        { key: 'paypal', icon: '&#127359;&#65039;', label: 'PayPal' },
                      ].map(tab => (
                        <div
                          key={tab.key}
                          className={`pay-tab${formData.payMethod === tab.key ? ' active' : ''}`}
                          onClick={() => currentStep === 3 && setFormData(d => ({ ...d, payMethod: tab.key }))}
                        >
                          <div className="pay-tab-icon" dangerouslySetInnerHTML={{ __html: tab.icon }} />
                          <div className="pay-tab-label">{tab.label}</div>
                        </div>
                      ))}
                    </div>

                    {formData.payMethod === 'card' && (
                      <>
                        <div className="field-row single">
                          <div className="field">
                            <div className="field-label">Cardholder Name</div>
                            <input className="field-input" type="text" placeholder="Name on card" disabled={currentStep > 3} />
                          </div>
                        </div>
                        <div className="field-row single">
                          <div className="field">
                            <div className="field-label">Card Number</div>
                            <div className="card-field">
                              <input className="field-input" type="text" placeholder="0000  0000  0000  0000" disabled={currentStep > 3} />
                              <div className="card-brand-icon">CARD</div>
                            </div>
                          </div>
                        </div>
                        <div className="field-row triple">
                          <div className="field">
                            <div className="field-label">Exp. Month</div>
                            <select className="field-select" disabled={currentStep > 3}>
                              <option value="">MM</option>
                              {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                                <option key={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div className="field">
                            <div className="field-label">Exp. Year</div>
                            <select className="field-select" disabled={currentStep > 3}>
                              {[2026, 2027, 2028, 2029, 2030].map(y => (
                                <option key={y}>{y}</option>
                              ))}
                            </select>
                          </div>
                          <div className="field">
                            <div className="field-label">CVV</div>
                            <input className="field-input" type="text" placeholder="&bull;&bull;&bull;" maxLength={4} disabled={currentStep > 3} />
                          </div>
                        </div>
                      </>
                    )}

                    {currentStep === 3 && (
                      <div style={{ marginTop: '14px' }}>
                        <button className="btn btn-accent" onClick={() => advanceStep(3)}>
                          Review order &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 4: Review & Place Order */}
              <div className={`form-panel${currentStep < 4 ? ' locked' : ''}`}>
                <div className="fp-header">
                  <div className="fp-title">
                    <div className="fp-step-badge" style={currentStep < 4 ? { background: 'var(--muted-foreground)' } : {}}>4</div>
                    Review &amp; Place Order
                  </div>
                </div>
                {currentStep >= 4 && (
                  <div className="fp-body">
                    <div style={{
                      background: 'var(--muted)',
                      border: '2px solid var(--border)',
                      borderRadius: 'var(--r-lg, 24px)',
                      padding: '14px 16px',
                      marginBottom: '16px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--muted-foreground)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}>
                      <span style={{ fontSize: '1rem', flexShrink: 0 }}>&#128274;</span>
                      <span>Your products will be delivered <strong style={{ color: 'var(--foreground)' }}>instantly</strong> after payment. Access details will be sent to your email.</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      {formData.firstName && (
                        <div className="sd-row">
                          <span className="sd-key">Name</span>
                          <span className="sd-val">{formData.firstName} {formData.lastName}</span>
                        </div>
                      )}
                      {formData.email && (
                        <div className="sd-row">
                          <span className="sd-key">Email</span>
                          <span className="sd-val">{formData.email}</span>
                        </div>
                      )}
                      <div className="sd-row">
                        <span className="sd-key">Payment</span>
                        <span className="sd-val">{formData.payMethod === 'card' ? 'Card' : formData.payMethod === 'bank' ? 'Bank Transfer' : formData.payMethod === 'qris' ? 'QRIS / GoPay' : 'PayPal'}</span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: 'rgba(139, 92, 246, 0.06)',
                      border: '2px solid var(--accent)',
                      borderRadius: 'var(--r-md)',
                      marginBottom: '16px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}>
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={e => setAgreedToTerms(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                      />
                      <label style={{ cursor: 'pointer' }}>
                        I agree to the <a href="#" style={{ color: 'var(--accent)', fontWeight: 700 }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--accent)', fontWeight: 700 }}>Privacy Policy</a>.
                      </label>
                    </div>

                    {error && <div className="checkout-error">{error}</div>}

                    <button
                      className="btn btn-accent btn-full"
                      style={{ justifyContent: 'center', padding: '14px 32px', fontSize: '1rem', background: 'var(--quaternary)', color: 'var(--foreground)' }}
                      onClick={handleCheckout}
                      disabled={submitting || !agreedToTerms}
                    >
                      {submitting ? (
                        <><Loader2 size={18} className="spin" /> Processing...</>
                      ) : (
                        <><Check size={18} /> Place order &mdash; {formatCurrency(subtotal, currency)}</>
                      )}
                    </button>
                    <div style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted-foreground)', marginTop: '10px' }}>
                      &#128274; SSL secured &middot; Your card is charged once
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div>
              <div className="order-summary" style={{ top: '80px' }}>
                <div className="os-header">
                  <div className="os-title">Your order</div>
                </div>
                <div className="os-body">
                  <div style={{ marginBottom: '14px' }}>
                    {cartProducts.map(product => (
                      <div className="review-item" key={product.id}>
                        <div className="ri-icon" style={{ background: ICON_COLORS[getCatSlug(product)] || ICON_COLORS.template }}>
                          {'📦'}
                        </div>
                        <div className="ri-info">
                          <div className="ri-name">{product.name}</div>
                          <div className="ri-meta">
                            {product.category?.name || 'Product'}
                            {getQty(product.id) > 1 ? ` x${getQty(product.id)}` : ''}
                          </div>
                        </div>
                        <div className="ri-price">{formatCurrency(product.price_amount * getQty(product.id), product.price_currency)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="os-divider"></div>
                  <div className="os-line">
                    <span className="os-label">Subtotal</span>
                    <span className="os-value">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  <div className="os-divider"></div>
                  <div className="os-total-row" style={{ marginBottom: '10px' }}>
                    <span className="os-total-label">Total</span>
                    <span className="os-total-value">{formatCurrency(subtotal, currency)}</span>
                  </div>

                  <div className="os-trust">
                    <div className="trust-line">
                      <div className="trust-icon">&#9889;</div>
                      Instant delivery
                    </div>
                    <div className="trust-line">
                      <div className="trust-icon">&#128260;</div>
                      Cancel anytime
                    </div>
                    <div className="trust-line">
                      <div className="trust-icon">&#128737;&#65039;</div>
                      7-day refund guarantee
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <LoginDialog open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
