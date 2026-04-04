'use client';

import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-foreground/45 z-[500] flex items-center justify-center backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className={cn(
          'bg-card border-2 border-foreground rounded-xl',
          'shadow-[8px_8px_0_var(--shadow)] p-6 max-w-[520px] w-[90%] max-h-[80vh] overflow-y-auto',
          'animate-fade-up'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-heading text-base font-extrabold mb-3.5 flex items-center justify-between">
          <span>{title}</span>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-xs font-bold bg-muted border border-border rounded-full px-2 py-1 cursor-pointer hover:bg-border transition-colors"
          >
            ✕ Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
