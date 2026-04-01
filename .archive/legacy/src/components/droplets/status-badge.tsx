import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'new' | 'active' | 'off' | 'archive';
  className?: string;
}

const statusConfig = {
  active: {
    label: 'ONLINE',
    color: 'bg-quaternary',
    textColor: 'text-foreground',
  },
  off: {
    label: 'OFFLINE',
    color: 'bg-secondary',
    textColor: 'text-white',
  },
  new: {
    label: 'STARTING',
    color: 'bg-tertiary',
    textColor: 'text-foreground',
  },
  archive: {
    label: 'ARCHIVED',
    color: 'bg-muted',
    textColor: 'text-muted-foreground',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.off;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border-2 border-foreground shadow-pop',
        config.color,
        config.textColor,
        className
      )}
    >
      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
      {config.label}
    </div>
  );
}
