'use client';

import { BrandLogo } from './brand-logo';
import { AvatarChip } from '@/components/ui/avatar-chip';
import { Bell, Search } from 'lucide-react';

interface TopbarProps {
  variant?: 'dashboard' | 'admin' | 'catalog';
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  children?: React.ReactNode;
}

export function Topbar({ variant = 'dashboard', searchPlaceholder, onSearch, children }: TopbarProps) {
  const isCatalog = variant === 'catalog';

  const defaultPlaceholder = variant === 'admin'
    ? 'Search users, orders, products...'
    : variant === 'catalog'
    ? 'Search products...'
    : 'Search products, orders...';

  const placeholder = searchPlaceholder || defaultPlaceholder;

  if (isCatalog) {
    return (
      <header className="topbar">
        <BrandLogo />
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder={placeholder}
            id="globalSearch"
            onInput={onSearch ? (e) => onSearch(e.currentTarget.value) : undefined}
          />
        </div>
        <div className="topbar-right">
          {children || (
            <>
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
            </>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b-2 border-foreground shadow-[0_4px_0_var(--shadow)] flex items-center justify-between pr-5 z-[300]">
      <div className="w-[var(--sidebar-w)] flex-shrink-0 flex items-center px-4 gap-2.5 border-r-2 border-foreground h-full overflow-hidden transition-all duration-300">
        <BrandLogo />
        {variant === 'admin' && (
          <span className="bg-secondary/10 border-2 border-secondary text-secondary text-[0.6rem] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-pop-sm flex-shrink-0">
            Admin
          </span>
        )}
      </div>

      <div className="flex-1 px-5">
        <div className="flex items-center gap-2 bg-input border-2 border-border rounded-full px-3.5 py-[7px] max-w-[300px] transition-all duration-200 focus-within:border-accent focus-within:shadow-[3px_3px_0_var(--accent)]">
          <Search size={14} className="text-muted-foreground" />
          <input
            type="text"
            placeholder={placeholder}
            className="border-none outline-none bg-transparent font-body text-[0.8rem] font-medium text-foreground w-[200px] placeholder:text-muted-foreground"
            onInput={onSearch ? (e) => onSearch(e.currentTarget.value) : undefined}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {children || (
          <>
            <button className="w-9 h-9 rounded-full border-2 border-border bg-card flex items-center justify-center cursor-pointer text-muted-foreground transition-all duration-150 hover:border-foreground hover:shadow-pop-sm hover:text-foreground hover:-translate-x-px hover:-translate-y-px relative">
              <Bell size={16} />
              <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-secondary border-2 border-card rounded-full" />
            </button>
            <AvatarChip />
          </>
        )}
      </div>
    </header>
  );
}
