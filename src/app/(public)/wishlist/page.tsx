'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import { useWishlist } from '@/context/wishlist-context';
import { useCart } from '@/context/cart-context';
import { formatCurrency } from '@/lib/utils';
import { LoginDialog } from '@/components/ui/login-dialog';

interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  price_amount: number;
  price_currency: string;
  price_billing_period: string;
  category: { name: string } | null;
  status: string;
  thumb_color: string;
  icon_emoji: string;
}

export default function WishlistPage() {
  const { items: wishlistIds, toggleWishlist, isLoggedIn } = useWishlist();
  const { addItem, isInCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    setFetchError(false);
    fetch('/api/wishlist/products')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => setProducts(d.data || []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [isLoggedIn, wishlistIds.length]);

  const visibleProducts = products.filter(p => wishlistIds.includes(p.id));

  const handleRemove = async (productId: number) => {
    await toggleWishlist(productId);
  };

  const handleAddToCart = (productId: number) => {
    addItem(productId);
  };

  return (
    <div className="inner-page">
      <div className="inner-page-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to catalog</span>
        </Link>
        <div className="inner-page-title-row">
          <Heart size={28} />
          <h1>My Wishlist</h1>
          {visibleProducts.length > 0 && (
            <span className="inner-page-count">{visibleProducts.length} item{visibleProducts.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="icon">⏳</div>
          <h3>Loading your wishlist</h3>
          <p>Fetching your saved items...</p>
        </div>
      ) : fetchError ? (
        <div className="empty-state">
          <div className="icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>Could not load your wishlist. Please try again.</p>
          <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : !isLoggedIn ? (
        <div className="empty-state">
          <div className="icon">🔒</div>
          <h3>Sign in to see your wishlist</h3>
          <p>Log in to save and view your favorite products.</p>
          <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowLogin(true)}>
            Sign In
          </button>
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="empty-state">
          <div className="icon">💜</div>
          <h3>Your wishlist is empty</h3>
          <p>Browse our catalog and save products you love.</p>
          <Link href="/" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="item-list">
          {visibleProducts.map(product => (
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
                <button
                  className={`item-btn btn-accent ${isInCart(product.id) ? 'btn-disabled' : ''}`}
                  onClick={() => handleAddToCart(product.id)}
                  disabled={isInCart(product.id)}
                >
                  <ShoppingCart size={14} />
                  <span>{isInCart(product.id) ? 'In Cart' : 'Add to Cart'}</span>
                </button>
                <button className="item-btn btn-ghost-danger" onClick={() => handleRemove(product.id)}>
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LoginDialog open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
