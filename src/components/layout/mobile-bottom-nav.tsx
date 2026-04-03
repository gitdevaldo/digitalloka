'use client';

import { SlidersHorizontal, ShoppingBag, Heart } from 'lucide-react';
import { useWishlist } from '@/context/wishlist-context';

interface MobileBottomNavProps {
  onFilterToggle: () => void;
}

export function MobileBottomNav({ onFilterToggle }: MobileBottomNavProps) {
  const wishlist = useWishlist();

  return (
    <nav className="mobile-bottom-nav">
      <button className="mobile-nav-btn" onClick={onFilterToggle}>
        <SlidersHorizontal size={20} />
        <span>Filter</span>
      </button>
      <button className="mobile-nav-btn">
        <ShoppingBag size={20} />
        <span>Cart</span>
      </button>
      <button className="mobile-nav-btn" onClick={() => {}}>
        <Heart size={20} />
        <span>Wishlist</span>
        {(wishlist?.count ?? 0) > 0 && (
          <span className="mobile-nav-badge">{wishlist.count}</span>
        )}
      </button>
    </nav>
  );
}
