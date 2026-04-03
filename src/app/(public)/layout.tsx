'use client';

import { Topbar } from '@/components/layout/topbar';
import { WishlistProvider } from '@/context/wishlist-context';
import { CartProvider } from '@/context/cart-context';

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  const handleSearch = (value: string) => {
    const searchEvent = new CustomEvent('catalog-search', { detail: value });
    window.dispatchEvent(searchEvent);
  };

  return (
    <WishlistProvider>
      <CartProvider>
        <div className="relative z-[1]">
          <Topbar variant="catalog" onSearch={handleSearch} />
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
      </CartProvider>
    </WishlistProvider>
  );
}
