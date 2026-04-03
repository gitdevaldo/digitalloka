'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useWishlist } from '@/context/wishlist-context';
import { useCart } from '@/context/cart-context';
import { LoginDialog } from '@/components/ui/login-dialog';
import { FloatingBar } from '@/components/layout/floating-bar';
import { SlidersHorizontal, ShoppingBag, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

const THUMBS = ['thumb-purple', 'thumb-pink', 'thumb-amber', 'thumb-green', 'thumb-blue', 'thumb-red', 'thumb-teal', 'thumb-orange'];
const ICONS = ['🎨', '🚀', '📘', '⚡', '✅', '🤖', '🧩', '📊', '📱', '📕', '✍️', '📈'];

interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  product_type: string;
  status: string;
  rating: number;
  reviews_count: number;
  tags: string[];
  badges: string[];
  price_amount: number;
  price_currency: string;
  price_billing_period: string;
  category: { name: string; slug: string } | null;
}

interface NormalizedProduct {
  id: number;
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  desc: string;
  price: number;
  currency: string;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  tags: string[];
  thumb: string;
  icon: string;
  badges: string[];
  isNew: boolean;
  isSale: boolean;
}

function normalizeProduct(item: Product): NormalizedProduct {
  const price = Number(item?.price_amount ?? 0);
  const currency = item?.price_currency || 'USD';
  const badges = Array.isArray(item.badges) ? item.badges : [];
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const id = Number(item.id ?? 0);

  return {
    id,
    slug: String(item.slug ?? ''),
    title: String(item.name ?? 'Untitled Product'),
    category: String(item?.category?.slug ?? 'uncategorized'),
    categoryName: String(item?.category?.name ?? 'Uncategorized'),
    desc: String(item.short_description || 'No description available.'),
    price,
    currency,
    originalPrice: badges.includes('sale') ? Number((price * 1.35).toFixed(0)) : null,
    rating: Number(item.rating ?? 0),
    reviews: Number(item.reviews_count ?? 0),
    tags,
    thumb: THUMBS[id % THUMBS.length],
    icon: ICONS[id % ICONS.length],
    badges,
    isNew: badges.includes('new'),
    isSale: badges.includes('sale'),
  };
}

export default function CatalogPage() {
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(200);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const wishlistCtx = useWishlist();
  const { isInWishlist, toggleWishlist } = wishlistCtx;
  const { addItem: addToCart } = useCart();
  const router = useRouter();

  const handleWishlist = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleWishlist(productId);
    if (result === 'login_required') {
      setShowLoginDialog(true);
    }
  };

  const handleBuy = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(productId);
    router.push('/cart');
  };
  const [minRating, setMinRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      setSearch((e as CustomEvent).detail || '');
    };
    window.addEventListener('catalog-search', handler);
    return () => window.removeEventListener('catalog-search', handler);
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('per_page', '100');
    const sortMap: Record<string, string> = {
      featured: 'featured', newest: 'newest', 'price-asc': 'price_asc', 'price-desc': 'price_desc', rating: 'rating',
    };
    params.set('sort', sortMap[sort] || 'featured');
    if (category !== 'all') params.set('category', category);
    if (maxPrice < 200) params.set('max_price', String(maxPrice));
    if (minRating > 0) params.set('rating_min', String(minRating));
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (selectedStatus.length > 0) params.set('badges', selectedStatus.join(','));
    if (search.trim()) params.set('search', search.trim());

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const payload = await res.json();
      const data = Array.isArray(payload.data) ? payload.data : [];
      setProducts(data.map(normalizeProduct));
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, sort, maxPrice, minRating, selectedTags, selectedStatus, search]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const categoryCounts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  const avgRating = products.length > 0
    ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)
    : '0.0';

  const totalReviews = products.reduce((sum, p) => sum + p.reviews, 0);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };
  const toggleStatus = (s: string) => {
    setSelectedStatus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };
  const toggleRating = (r: number) => {
    setMinRating(prev => prev === r ? 0 : r);
  };
  const resetAllFilters = () => {
    setCategory('all');
    setMaxPrice(200);
    setMinRating(0);
    setSelectedTags([]);
    setSelectedStatus([]);
    setSort('featured');
  };

  const badgeMap: Record<string, [string, string]> = {
    bestseller: ['badge-tertiary', '🔥 Bestseller'],
    sale: ['badge-secondary', '🏷 Sale'],
    new: ['badge-quaternary', '✨ New'],
  };

  const sidebarContent = (
    <>
      <div className="sidebar-section">
        <div className="sidebar-title">Category</div>
        <div className="filter-chip-group">
          <div className={`filter-chip ${category === 'all' ? 'active' : ''}`} onClick={() => { setCategory('all'); setMobileFilterOpen(false); }}>
            <div className="dot"></div>
            All Products
            <span className="chip-count">{products.length}</span>
          </div>
          {['template', 'ui-kit', 'plugin', 'ebook', 'course'].map(cat => (
            <div key={cat} className={`filter-chip ${category === cat ? 'active' : ''}`} onClick={() => { setCategory(cat); setMobileFilterOpen(false); }}>
              <div className="dot"></div>
              {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              <span className="chip-count">{categoryCounts[cat] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-divider"></div>

      <div className="sidebar-section">
        <div className="sidebar-title">Price Range</div>
        <div className="price-range">
          <div className="range-row">
            <span>$0</span>
            <span>${maxPrice}</span>
          </div>
          <input type="range" min="0" max="200" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
          <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>
            Under <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>${maxPrice}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-divider"></div>

      <div className="sidebar-section">
        <div className="sidebar-title">Rating</div>
        <div className="filter-chip-group">
          <div className={`filter-chip ${minRating === 0 ? '' : ''}`} onClick={() => toggleRating(0)}>
            <span style={{ color: 'var(--tertiary)' }}>★★★★★</span> Any
          </div>
          <div className={`filter-chip ${minRating === 4 ? 'active' : ''}`} onClick={() => toggleRating(4)}>
            <span style={{ color: 'var(--tertiary)' }}>★★★★</span> + &amp; up
          </div>
          <div className={`filter-chip ${minRating === 3 ? 'active' : ''}`} onClick={() => toggleRating(3)}>
            <span style={{ color: 'var(--tertiary)' }}>★★★</span> + &amp; up
          </div>
        </div>
      </div>

      <div className="sidebar-divider"></div>

      <div className="sidebar-section">
        <div className="sidebar-title">Tags</div>
        <div className="tag-cloud">
          {['Figma', 'React', 'Tailwind', 'Next.js', 'WordPress', 'Notion', 'AI', 'SaaS'].map(tag => (
            <div key={tag} className={`tag ${selectedTags.includes(tag.toLowerCase()) ? 'active' : ''}`} onClick={() => toggleTag(tag.toLowerCase())}>
              {tag}
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-divider"></div>

      <div className="sidebar-section">
        <div className="sidebar-title">Status</div>
        <div className="filter-chip-group">
          <div className={`filter-chip ${selectedStatus.includes('sale') ? 'active' : ''}`} onClick={() => toggleStatus('sale')}>
            <div className="dot" style={{ background: 'var(--secondary)', borderColor: 'var(--secondary)' }}></div>
            On Sale
          </div>
          <div className={`filter-chip ${selectedStatus.includes('new') ? 'active' : ''}`} onClick={() => toggleStatus('new')}>
            <div className="dot" style={{ background: 'var(--quaternary)', borderColor: 'var(--quaternary)' }}></div>
            New Arrivals
          </div>
          <div className={`filter-chip ${selectedStatus.includes('bestseller') ? 'active' : ''}`} onClick={() => toggleStatus('bestseller')}>
            <div className="dot" style={{ background: 'var(--tertiary)', borderColor: 'var(--tertiary)' }}></div>
            Bestsellers
          </div>
        </div>
      </div>

      <div style={{ marginTop: '8px' }}>
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => { resetAllFilters(); setMobileFilterOpen(false); }}>
          Reset All Filters
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="catalog-sidebar">
        {sidebarContent}
      </aside>

      <main className="catalog-main">
        <div className="hero-strip">
          <div className="hero-text">
            <h1>Premium Digital<br />Products <span>for Builders</span></h1>
            <p>Templates, UI Kits, Plugins &amp; more — download instantly.</p>
          </div>
          <div className="hero-badges">
            <div className="hero-badge">
              <span className="num">{products.length}</span>
              <span className="label">Products</span>
            </div>
            <div className="hero-badge">
              <span className="num">{avgRating}★</span>
              <span className="label">Avg Rating</span>
            </div>
            <div className="hero-badge">
              <span className="num">{totalReviews}</span>
              <span className="label">Reviews</span>
            </div>
          </div>
        </div>

        <div className="toolbar">
          <div className="toolbar-left">
            <span className="result-count">Showing <span>{products.length}</span> products</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="product-grid">
            <div className="empty-state">
              <div className="icon">⏳</div>
              <h3>Loading products</h3>
              <p>Fetching latest catalog data...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="product-grid">
            <div className="empty-state">
              <div className="icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search query.</p>
            </div>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p, i) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="product-card" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`card-thumb ${p.thumb}`}>
                  <div className="card-thumb-icon">{p.icon}</div>
                  <div className="card-badge-top">
                    {p.badges.map(b => badgeMap[b] ? (
                      <span key={b} className={`badge ${badgeMap[b][0]}`}>{badgeMap[b][1]}</span>
                    ) : null)}
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-category">{p.categoryName}</div>
                  <div className="card-title">{p.title}</div>
                  <div className="card-desc">{p.desc}</div>
                  <div className="card-rating">
                    <span className="star">★</span> {p.rating} <span style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>({p.reviews})</span>
                  </div>
                  <div className="card-tags">
                    {p.tags.map(t => <span key={t} className="card-tag">{t}</span>)}
                  </div>
                </div>
                <div className="card-footer">
                  <div className="price-block">
                    <div className="price-main">{formatCurrency(p.price, p.currency)}</div>
                    {p.originalPrice && <div className="price-original">{formatCurrency(p.originalPrice, p.currency)}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      className={`wishlist-btn${isInWishlist(p.id) ? ' wishlisted' : ''}`}
                      onClick={e => handleWishlist(e, p.id)}
                      title={isInWishlist(p.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist(p.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                    <button className="buy-btn" onClick={e => handleBuy(e, p.id)}>Buy Now</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <LoginDialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} />

      {mobileFilterOpen && (
        <div className="mobile-filter-overlay" onClick={() => setMobileFilterOpen(false)}>
          <div className="mobile-filter-panel" onClick={e => e.stopPropagation()}>
            <div className="mobile-filter-header">
              <span className="mobile-filter-title">Filters</span>
              <button className="mobile-filter-close" onClick={() => setMobileFilterOpen(false)}>✕</button>
            </div>
            <div className="mobile-filter-body">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      <FloatingBar alwaysVisible>
        <button className="floating-bar-btn" onClick={() => setMobileFilterOpen(o => !o)}>
          <SlidersHorizontal size={18} />
        </button>
        <div className="floating-bar-divider" />
        <button className="floating-bar-btn" onClick={() => router.push('/cart')}>
          <ShoppingBag size={18} />
        </button>
        <div className="floating-bar-divider" />
        <button className="floating-bar-btn" onClick={() => router.push('/wishlist')}>
          <Heart size={18} />
          {(wishlistCtx.count ?? 0) > 0 && (
            <span className="floating-bar-badge">{wishlistCtx.count}</span>
          )}
        </button>
      </FloatingBar>
    </>
  );
}
