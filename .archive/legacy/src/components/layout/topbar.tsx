'use client';

import { useRouter } from 'next/navigation';
import type { User } from '@/lib/auth';
import { BrandLogo } from '@/components/ui/brand-logo';

interface TopbarProps {
  user: User;
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-card border-b-2 border-foreground">
      <div className="flex items-center">
        <BrandLogo />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full border-2 border-border">
          <div className="w-2 h-2 bg-quaternary rounded-full"></div>
          <span className="text-sm font-medium">{user.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-bold border-2 border-foreground rounded-full hover:bg-tertiary transition-all duration-300 ease-bounce active:translate-x-[1px] active:translate-y-[1px]"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
