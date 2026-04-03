'use client';

import { BrandLogo } from './brand-logo';
import { AvatarChip } from '@/components/ui/avatar-chip';
import { Bell, Search } from 'lucide-react';

interface TopbarProps {
  variant?: 'dashboard' | 'admin' | 'catalog';
  onToggleSidebar?: () => void;
}

export function Topbar({ variant = 'dashboard', onToggleSidebar }: TopbarProps) {
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
            placeholder={variant === 'admin' ? 'Search users, orders, products...' : 'Search products, orders...'}
            className="border-none outline-none bg-transparent font-body text-[0.8rem] font-medium text-foreground w-[200px] placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-full border-2 border-border bg-card flex items-center justify-center cursor-pointer text-muted-foreground transition-all duration-150 hover:border-foreground hover:shadow-pop-sm hover:text-foreground hover:-translate-x-px hover:-translate-y-px relative">
          <Bell size={16} />
          <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-secondary border-2 border-card rounded-full" />
        </button>
        <AvatarChip />
      </div>
    </header>
  );
}
