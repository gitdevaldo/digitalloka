'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  price_amount: number;
  price_currency: string;
  price_billing_period: string;
  category: { name: string } | null;
  thumb_color: string;
  icon_emoji: string;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

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
    <div className="inner-page">
      <div className="inner-page-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to catalog</span>
        </Link>
        <div className="inner-page-title-row">
          <ShoppingCart size={28} />
          <h1>Shopping Cart</h1>
          {cartProducts.length > 0 && (
            <span className="inner-page-count">{items.reduce((a, i) => a + i.quantity, 0)} item{items.reduce((a, i) => a + i.quantity, 0) !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="icon">⏳</div>
          <h3>Loading your cart</h3>
          <p>Fetching product details...</p>
        </div>
      ) : fetchError ? (
        <div className="empty-state">
          <div className="icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>Could not load cart details. Please try again.</p>
          <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : cartProducts.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add products to your cart to get started.</p>
          <Link href="/" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="item-list">
            {cartProducts.map(product => {
              const ci = getCartItem(product.id);
              if (!ci) return null;
              const lineTotal = product.price_amount * ci.quantity;
              return (
                <div key={product.id} className="item-card">
                  <Link href={`/products/${product.slug}`} className="item-card-thumb">
                    <div className={`card-thumb-mini ${product.thumb_color || 'thumb-purple'}`}>
                      <span className="thumb-icon">{product.icon_emoji || '📦'}</span>
                    </div>
                  </Link>
                  <div className="item-card-info">
                    <Link href={`/products/${product.slug}`} className="item-card-name">{product.name}</Link>
                    <p className="item-card-desc">{product.short_description}</p>
                    <div className="item-card-meta">
                      {product.category && <span className="item-card-cat">{product.category.name}</span>}
                      <span className="item-card-price">
                        {formatCurrency(product.price_amount, product.price_currency)}
                        {product.price_billing_period && product.price_billing_period !== 'one-time' && (
                          <span className="billing-period"> / {product.price_billing_period}</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="item-card-actions">
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQuantity(product.id, ci.quantity - 1)} disabled={ci.quantity <= 1}>
                        <Minus size={14} />
                      </button>
                      <span className="qty-value">{ci.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(product.id, ci.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="item-line-total">{formatCurrency(lineTotal, product.price_currency)}</span>
                    <button className="item-btn btn-ghost-danger" onClick={() => removeItem(product.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span className="cart-summary-value">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="cart-summary-row total">
              <span>Total</span>
              <span className="cart-summary-value">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="cart-summary-actions">
              <button className="item-btn btn-ghost" onClick={clearCart}>Clear Cart</button>
              <Link href="/checkout" className="btn-primary">
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
