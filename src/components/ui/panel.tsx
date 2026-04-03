import { cn } from '@/lib/utils';

interface PanelProps {
  title?: string;
  actions?: React.ReactNode;
  variant?: 'dashboard' | 'admin';
  noPad?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Panel({ title, actions, noPad, children, className }: PanelProps) {
  const hasHeader = !!(title || actions);
  return (
    <div className={cn('bg-card border-2 border-foreground rounded-[14px] overflow-hidden mb-5 shadow-pop', className)}>
      {hasHeader && (
        <div className="px-5 py-3.5 border-b-2 border-border flex items-center justify-between gap-3">
          {title && <div className="font-heading text-base font-extrabold text-foreground">{title}</div>}
          {actions}
        </div>
      )}
      {noPad ? children : <div className={hasHeader ? 'p-5' : 'p-4'}>{children}</div>}
    </div>
  );
}
