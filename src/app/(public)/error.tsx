'use client';

import { useEffect } from 'react';

export default function PublicErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Public page error:', error);
  }, [error]);

  return (
    <div className="inner-wrap" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <div className="empty-title">Something went wrong</div>
        <div className="empty-desc">
          We ran into an unexpected error. Please try again or go back to the catalog.
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
          <button className="btn btn-accent" onClick={reset}>
            Try Again
          </button>
          <a href="/" className="btn btn-ghost">
            Back to Catalog
          </a>
        </div>
      </div>
    </div>
  );
}
