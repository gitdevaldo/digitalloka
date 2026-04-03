'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useWishlist } from '@/context/wishlist-context';
import { useCart } from '@/context/cart-context';
import { formatCurrency } from '@/lib/utils';
import { LoginDialog } from '@/components/ui/login-dialog';
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
  status: string;
  icon_emoji: string;
}

const ICON_COLORS: Record<string, string> = {
  template: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
  'ui-kit': 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
  plugin: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
  ebook: 'linear-gradient(135deg, #fef3c7, #fde68a)',
  course: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
};

export default function WishlistPage() {
  const { items: wishlistIds, toggleWishlist, isLoggedIn } = useWishlist();
  const { addItem, isInCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

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

  const totalValue = visibleProducts.reduce((sum, p) => sum + p.price_amount, 0);
  const currency = visibleProducts[0]?.price_currency || 'USD';

  const handleRemove = async (productId: number) => {
    await toggleWishlist(productId);
  };

  const handleAddToCart = (productId: number) => {
    addItem(productId);
  };

  const handleBuyNow = (productId: number) => {
    addItem(productId);
    router.push('/cart');
  };

  return (
    <div className="inner-wrap">
      <div className="page-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} />
          Back to catalog
        </Link>
        <div className="page-title">Wishlist</div>
        <div className="page-sub">
          {visibleProducts.length > 0
            ? `${visibleProducts.length} product${visibleProducts.length !== 1 ? 's' : ''} saved — add to cart when you're ready`
            : 'Your saved products will appear here'}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">&#9203;</div>
          <div className="empty-title">Loading your wishlist</div>
          <div className="empty-desc">Fetching your saved items...</div>
        </div>
      ) : fetchError ? (
        <div className="empty-state">
          <div className="empty-icon">&#9888;&#65039;</div>
          <div className="empty-title">Something went wrong</div>
          <div className="empty-desc">Could not load your wishlist. Please try again.</div>
          <button className="btn btn-accent" onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : !isLoggedIn ? (
        <div className="empty-state">
          <div className="empty-icon">&#128274;</div>
          <div className="empty-title">Sign in to see your wishlist</div>
          <div className="empty-desc">Log in to save and view your favorite products.</div>
          <button className="btn btn-accent" onClick={() => setShowLogin(true)}>Sign In</button>
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#128156;</div>
          <div className="empty-title">Your wishlist is empty</div>
          <div className="empty-desc">Browse our catalog and save products you love.</div>
          <Link href="/" className="btn btn-accent">Browse Products</Link>
        </div>
      ) : (
        <>
          <div className="wishlist-grid">
            {visibleProducts.map(product => {
              const catSlug = product.category?.name?.toLowerCase().replace(/\s+/g, '-') || 'template';
              const iconBg = ICON_COLORS[catSlug] || ICON_COLORS.template;
              return (
                <div className="wish-card" key={product.id}>
                  <div className="wish-card-top">
                    <div className="prod-icon" style={{ background: iconBg }}>
                      {product.icon_emoji || '📦'}
                    </div>
                    <div className="wish-card-info">
                      <div className="wish-type">{product.category?.name || 'Product'}</div>
                      <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="wish-name">{product.name}</div>
                      </Link>
                      <div className="wish-desc">{product.short_description}</div>
                      <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                        <span className="badge b-green" style={{ fontSize: '0.58rem' }}>
                          <span className="dot"></span>{product.status || 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="wish-card-footer">
                    <div className="wish-price">
                      <div className="wish-price-main">
                        {formatCurrency(product.price_amount, product.price_currency)}
                        {product.price_billing_period && product.price_billing_period !== 'one-time' && (
                          <span className="wish-price-period">/{product.price_billing_period}</span>
                        )}
                      </div>
                    </div>
                    <div className="wish-actions">
                      <button
                        className="remove-btn"
                        title="Remove from wishlist"
                        onClick={() => handleRemove(product.id)}
                      >
                        &#10005;
                      </button>
                      <button
                        className={`btn btn-ghost btn-sm${isInCart(product.id) ? ' btn-disabled' : ''}`}
                        onClick={() => handleAddToCart(product.id)}
                        disabled={isInCart(product.id)}
                        style={isInCart(product.id) ? { opacity: 0.5 } : {}}
                      >
                        {isInCart(product.id) ? 'In Cart' : 'Add to cart'}
                      </button>
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => handleBuyNow(product.id)}
                      >
                        Buy now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="wishlist-summary">
            <div className="ws-left">
              <div className="ws-stat">
                <div className="ws-stat-val">{visibleProducts.length}</div>
                <div className="ws-stat-lbl">Items</div>
              </div>
              <div className="ws-stat">
                <div className="ws-stat-val">{formatCurrency(totalValue, currency)}</div>
                <div className="ws-stat-lbl">Total Value</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-accent"
                onClick={() => {
                  visibleProducts.forEach(p => { if (!isInCart(p.id)) addItem(p.id); });
                  router.push('/cart');
                }}
              >
                Add all to cart
              </button>
            </div>
          </div>
        </>
      )}

      <LoginDialog open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
