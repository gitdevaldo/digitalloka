'use client';

import { BrandLogo } from '@/components/layout/brand-logo';
import { Search } from 'lucide-react';

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  const handleSearch = (e: React.FormEvent<HTMLInputElement>) => {
    const searchEvent = new CustomEvent('catalog-search', { detail: e.currentTarget.value });
    window.dispatchEvent(searchEvent);
  };

  return (
    <div className="relative z-[1]">
      <div className="topbar">
        <BrandLogo />
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            id="globalSearch"
            onInput={handleSearch}
          />
        </div>
        <div className="topbar-right">
          <a href="#" className="btn btn-ghost" id="wishlistButton">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span className="tb-label">Wishlist</span>
            <span className="tb-wishlist-count">(0)</span>
          </a>
          <a href="#" className="btn btn-accent" id="cartButton">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="tb-label">Cart</span>
            <span className="tb-cart-count">(0)</span>
          </a>
        </div>
      </div>
      <div className="page-wrapper">
        {children}
      </div>
      <footer className="catalog-footer">
        <div>&copy; 2026 <strong>DigitalLoka</strong> — All rights reserved.</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Support</a>
        </div>
      </footer>
    </div>
  );
}
