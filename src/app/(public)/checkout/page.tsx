'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Zap, CreditCard, Loader2 } from 'lucide-react';
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
  icon_emoji: string;
}

export default function CheckoutPage() {
  const router = useRouter();
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
      <div className="inner-page">
        <div className="checkout-success">
          <div className="success-icon">✅</div>
          <h1>Order Placed!</h1>
          <p>Your order <strong>{orderNumber}</strong> has been placed successfully.</p>
          <p className="success-sub">You will receive a confirmation and can track your order from your dashboard.</p>
          <div className="success-actions">
            <Link href="/" className="btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <Link href="/cart" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to cart</span>
        </Link>
        <div className="inner-page-title-row">
          <CreditCard size={28} />
          <h1>Checkout</h1>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="icon">⏳</div>
          <h3>Loading checkout</h3>
          <p>Preparing your order...</p>
        </div>
      ) : fetchError ? (
        <div className="empty-state">
          <div className="icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>Could not load checkout details. Please try again.</p>
          <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : cartProducts.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>Nothing to checkout</h3>
          <p>Your cart is empty. Add some products first.</p>
          <Link href="/" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <div className="checkout-items">
            <h2 className="checkout-section-title">Order Summary</h2>
            <div className="checkout-item-list">
              {cartProducts.map(product => {
                const qty = getQty(product.id);
                return (
                  <div key={product.id} className="checkout-item">
                    <div className="checkout-item-icon">{product.icon_emoji || '📦'}</div>
                    <div className="checkout-item-info">
                      <span className="checkout-item-name">{product.name}</span>
                      <span className="checkout-item-meta">
                        {product.category?.name}
                        {qty > 1 && <> &middot; Qty: {qty}</>}
                      </span>
                    </div>
                    <span className="checkout-item-price">
                      {formatCurrency(product.price_amount * qty, product.price_currency)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="checkout-total-row total">
                <span>Total</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
            </div>
          </div>

          <div className="checkout-payment">
            <h2 className="checkout-section-title">Payment</h2>

            <div className="checkout-trust">
              <div className="trust-item">
                <ShieldCheck size={18} />
                <span>Secure checkout</span>
              </div>
              <div className="trust-item">
                <Zap size={18} />
                <span>Instant delivery</span>
              </div>
            </div>

            {error && (
              <div className="checkout-error">{error}</div>
            )}

            <button
              className="btn-checkout"
              onClick={handleCheckout}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>Place Order &middot; {formatCurrency(subtotal, currency)}</span>
                </>
              )}
            </button>

            <p className="checkout-note">
              By placing this order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      )}

      <LoginDialog open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
