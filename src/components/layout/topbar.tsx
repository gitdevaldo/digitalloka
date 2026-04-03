'use client';

import Link from 'next/link';
import { BrandLogo } from './brand-logo';
import { AvatarChip } from '@/components/ui/avatar-chip';
import { Bell, Search, LogIn, LayoutDashboard } from 'lucide-react';
import { useWishlist } from '@/context/wishlist-context';
import { useCart } from '@/context/cart-context';

interface TopbarProps {
  variant?: 'dashboard' | 'admin' | 'catalog';
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  children?: React.ReactNode;
}

export function Topbar({ variant = 'dashboard', searchPlaceholder, onSearch, children }: TopbarProps) {
  const isCatalog = variant === 'catalog';
  const wishlist = useWishlist();
  const cart = useCart();

  const defaultPlaceholder = variant === 'admin'
    ? 'Search users, orders, products...'
    : variant === 'catalog'
    ? 'Search products...'
    : 'Search products, orders...';

  const placeholder = searchPlaceholder || defaultPlaceholder;

  const defaultRightContent = isCatalog ? (
    <>
      <Link href="/wishlist" className="btn btn-ghost desktop-only">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span className="tb-label">Wishlist</span>
        <span className="tb-wishlist-count">({wishlist?.count ?? 0})</span>
      </Link>
      <Link href="/cart" className="btn btn-accent desktop-only">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span className="tb-label">Cart</span>
        <span className="tb-cart-count">({cart?.count ?? 0})</span>
      </Link>
      {wishlist?.isLoggedIn ? (
        <Link href="/dashboard" className="btn btn-ghost">
          <LayoutDashboard size={16} />
          <span className="tb-label">Dashboard</span>
        </Link>
      ) : (
        <Link href="/login" className="btn btn-ghost">
          <LogIn size={16} />
          <span className="tb-label">Login</span>
        </Link>
      )}
    </>
  ) : (
    <>
      <button className="w-9 h-9 rounded-full border-2 border-border bg-card flex items-center justify-center cursor-pointer text-muted-foreground transition-all duration-150 hover:border-foreground hover:shadow-pop-sm hover:text-foreground hover:-translate-x-px hover:-translate-y-px relative">
        <Bell size={16} />
        <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-secondary border-2 border-card rounded-full" />
      </button>
      <AvatarChip />
    </>
  );

  return (
    <>
      <header className="topbar">
        <div className="topbar-logo">
          <BrandLogo />
          {variant === 'admin' && (
            <span className="topbar-admin-badge">Admin</span>
          )}
        </div>

        <div className="topbar-center">
          <div className="topbar-search">
            <Search size={14} className="text-muted-foreground" />
            <input
              type="text"
              placeholder={placeholder}
              id={isCatalog ? 'globalSearch' : undefined}
              onInput={onSearch ? (e) => onSearch(e.currentTarget.value) : undefined}
            />
          </div>
        </div>

        <div className="topbar-right">
          {children || defaultRightContent}
        </div>
      </header>
    </>
  );
}
