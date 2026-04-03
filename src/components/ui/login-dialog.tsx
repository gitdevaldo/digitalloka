'use client';

import { X } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LoginDialog({ open, onClose }: LoginDialogProps) {
  if (!open) return null;

  return (
    <div className="login-dialog-overlay" onClick={onClose}>
      <div className="login-dialog" onClick={e => e.stopPropagation()}>
        <button className="login-dialog-close" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="login-dialog-icon">🔒</div>
        <h3 className="login-dialog-title">Login Required</h3>
        <p className="login-dialog-text">
          You need to be logged in to save products to your wishlist.
        </p>
        <div className="login-dialog-actions">
          <a href="/login" className="btn btn-accent btn-lg btn-full">
            Login Now
          </a>
          <button className="btn btn-ghost btn-full" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
