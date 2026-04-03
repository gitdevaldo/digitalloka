'use client';

import { useState } from 'react';
import { Topbar } from './topbar';
import { Sidebar } from './sidebar';
import { ToastProvider } from '@/components/ui/toast';

interface DashboardShellProps {
  variant?: 'dashboard' | 'admin';
  children: React.ReactNode;
}

export function DashboardShell({ variant = 'dashboard', children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ToastProvider>
      <div className="relative z-[1]">
        <Topbar variant={variant} />
        <div className="flex h-screen pt-16">
          <Sidebar variant={variant} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
          <main className="flex-1 h-[calc(100vh-var(--topbar-h))] overflow-y-auto overflow-x-hidden p-8 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
