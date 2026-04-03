import { cn } from '@/lib/utils';

interface PanelProps {
  title?: string;
  actions?: React.ReactNode;
  variant?: 'dashboard' | 'admin';
  children: React.ReactNode;
  className?: string;
}

export function Panel({ title, actions, variant = 'dashboard', children, className }: PanelProps) {
  return (
    <div className={cn('bg-card border-2 border-foreground rounded-[14px] overflow-hidden mb-5 shadow-pop', className)}>
      {(title || actions) && (
        <div className="px-5 py-3.5 border-b-2 border-border flex items-center justify-between gap-3">
          {title && <div className="font-heading text-base font-extrabold text-foreground">{title}</div>}
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
