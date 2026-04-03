'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string;
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

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const router = useRouter();

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

  const getCartItem = (productId: number) => items.find(i => i.productId === productId);
  const cartProducts = products.filter(p => items.some(i => i.productId === p.id));

  const subtotal = cartProducts.reduce((sum, p) => {
    const ci = getCartItem(p.id);
    return sum + (ci ? p.price_amount * ci.quantity : 0);
  }, 0);
  const currency = cartProducts[0]?.price_currency || 'USD';

  return (
    <div className="inner-wrap inner-wide">
      <div className="page-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} />
          Back to catalog
        </Link>
        <div className="page-title">Shopping Cart</div>
        <div className="page-sub">
          {cartProducts.length > 0
            ? `${cartProducts.length} item${cartProducts.length !== 1 ? 's' : ''} in your cart`
            : 'Your cart is empty'}
        </div>
      </div>

      {loading ? (
        <div className="inline-loader">
          <div className="spinner" />
          <span>Loading cart...</span>
        </div>
      ) : fetchError ? (
        <div className="empty-state">
          <div className="empty-icon">&#9888;&#65039;</div>
          <div className="empty-title">Something went wrong</div>
          <div className="empty-desc">Could not load cart details. Please try again.</div>
          <button className="btn btn-accent" onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : cartProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#128722;</div>
          <div className="empty-title">Your cart is empty</div>
          <div className="empty-desc">Add products to your cart to get started.</div>
          <Link href="/" className="btn btn-accent">Browse Products</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            <div className="cart-items">
              {cartProducts.map(product => {
                const ci = getCartItem(product.id);
                if (!ci) return null;
                const catSlug = product.category?.name?.toLowerCase().replace(/\s+/g, '-') || 'template';
                const iconBg = ICON_COLORS[catSlug] || ICON_COLORS.template;
                return (
                  <div className="cart-item" key={product.id}>
                    <div className="prod-icon" style={{ background: iconBg }}>
                      {'📦'}
                    </div>
                    <div className="cart-item-info">
                      <div className="ci-type">{product.category?.name || 'Product'}</div>
                      <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="ci-name">{product.name}</div>
                      </Link>
                      <div className="ci-meta">
                        <span className="ci-spec"><strong>{product.price_billing_period || 'one-time'}</strong> billing</span>
                      </div>
                    </div>
                    <div className="cart-item-right">
                      <div className="ci-price">
                        {formatCurrency(product.price_amount * ci.quantity, product.price_currency)}
                        {product.price_billing_period && product.price_billing_period !== 'one-time' && (
                          <div className="ci-period">/{product.price_billing_period}</div>
                        )}
                      </div>
                      <button className="ci-remove" onClick={() => removeItem(product.id)}>
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {cartProducts.length > 1 && (
              <div style={{ marginTop: '12px', textAlign: 'right' }}>
                <button className="btn btn-ghost btn-sm" onClick={clearCart}>Clear all</button>
              </div>
            )}
          </div>

          <div>
            <div className="order-summary">
              <div className="os-header">
                <div className="os-title">Order Summary</div>
              </div>
              <div className="os-body">
                <div style={{ marginBottom: '14px' }}>
                  {cartProducts.map(product => {
                    const ci = getCartItem(product.id);
                    const catSlug = product.category?.name?.toLowerCase().replace(/\s+/g, '-') || 'template';
                    const iconBg = ICON_COLORS[catSlug] || ICON_COLORS.template;
                    return (
                      <div className="review-item" key={product.id}>
                        <div className="ri-icon" style={{ background: iconBg }}>
                          {'📦'}
                        </div>
                        <div className="ri-info">
                          <div className="ri-name">{product.name}</div>
                          <div className="ri-meta">{product.category?.name || 'Product'} {ci && ci.quantity > 1 ? `x${ci.quantity}` : ''}</div>
                        </div>
                        <div className="ri-price">{formatCurrency(product.price_amount * (ci?.quantity || 1), product.price_currency)}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="os-divider"></div>
                <div className="os-line">
                  <span className="os-label">Subtotal</span>
                  <span className="os-value">{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="os-divider"></div>
                <div className="os-total-row" style={{ marginBottom: '16px' }}>
                  <span className="os-total-label">Total</span>
                  <span className="os-total-value">{formatCurrency(subtotal, currency)}</span>
                </div>

                <button
                  className="btn btn-accent btn-full"
                  style={{ justifyContent: 'center', padding: '14px 24px', fontSize: '0.95rem' }}
                  onClick={() => router.push('/checkout')}
                >
                  Proceed to Checkout
                </button>

                <div className="os-trust">
                  <div className="trust-line">
                    <div className="trust-icon">&#9889;</div>
                    Instant delivery after payment
                  </div>
                  <div className="trust-line">
                    <div className="trust-icon">&#128274;</div>
                    Secure checkout
                  </div>
                  <div className="trust-line">
                    <div className="trust-icon">&#128736;&#65039;</div>
                    Cancel anytime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
