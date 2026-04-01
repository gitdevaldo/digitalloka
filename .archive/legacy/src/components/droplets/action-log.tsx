import type { DropletAction } from '@/lib/digitalocean';
import { cn } from '@/lib/utils';

interface ActionLogProps {
  actions: DropletAction[];
}

const statusStyles = {
  'completed': { color: 'bg-quaternary', label: 'Completed' },
  'in-progress': { color: 'bg-tertiary animate-pulse', label: 'In Progress' },
  'errored': { color: 'bg-secondary', label: 'Failed' },
};

function formatActionType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActionLog({ actions }: ActionLogProps) {
  if (actions.length === 0) {
    return (
      <div className="bg-card border-2 border-foreground rounded-xl p-6 shadow-pop-soft">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Recent Actions</h2>
        <p className="text-muted-foreground text-center py-4">No recent actions</p>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-foreground rounded-xl overflow-hidden shadow-pop-soft">
      <div className="px-6 py-4 border-b-2 border-foreground bg-muted">
        <h2 className="text-sm font-bold uppercase tracking-wider">Recent Actions</h2>
      </div>
      <ul className="divide-y-2 divide-border">
        {actions.slice(0, 10).map((action) => {
          const status = statusStyles[action.status] || statusStyles['errored'];
          return (
            <li key={action.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors">
              <span className={cn('w-3 h-3 rounded-full border-2 border-foreground shrink-0', status.color)} />
              <div className="flex-1 min-w-0">
                <div className="font-bold">{formatActionType(action.type)}</div>
                <div className="text-xs text-muted-foreground font-medium">{status.label}</div>
              </div>
              <span className="text-sm text-muted-foreground font-medium shrink-0">
                {formatTime(action.started_at)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
