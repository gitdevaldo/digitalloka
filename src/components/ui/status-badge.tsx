import { cn } from '@/lib/utils';

const badgeVariants: Record<string, string> = {
  running: 'bg-quaternary text-foreground',
  active: 'bg-quaternary text-foreground',
  stopped: 'bg-secondary text-white',
  starting: 'bg-tertiary text-foreground',
  pending: 'bg-tertiary text-foreground',
  accent: 'bg-accent text-white',
  paid: 'bg-quaternary text-foreground',
  cancelled: 'bg-muted text-muted-foreground border-border shadow-none',
  fulfilled: 'bg-accent text-white',
  revoked: 'bg-secondary text-white',
  expired: 'bg-muted text-muted-foreground border-border shadow-none',
};

const dotColors: Record<string, string> = {
  running: 'bg-emerald-800',
  active: 'bg-emerald-800',
  stopped: 'bg-rose-800',
  starting: 'bg-amber-800',
  pending: 'bg-amber-800',
  paid: 'bg-emerald-800',
  cancelled: 'bg-gray-500',
  fulfilled: 'bg-violet-200',
  revoked: 'bg-rose-800',
  expired: 'bg-gray-500',
};

interface StatusBadgeProps {
  variant?: string;
  label: string;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ variant = 'active', label, showDot = true, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full',
        'text-[0.62rem] font-extrabold uppercase tracking-wide',
        'border-2 border-foreground whitespace-nowrap shadow-pop-sm',
        badgeVariants[variant] || 'bg-muted text-muted-foreground',
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant] || 'bg-gray-500')} />}
      {label}
    </span>
  );
}
