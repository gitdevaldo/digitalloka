'use client';

import { useEffect } from 'react';

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Something went wrong</h2>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1rem' }}>
        An error occurred in your dashboard. Please try again.
      </p>
      <button
        onClick={reset}
        className="btn btn-accent"
      >
        Try Again
      </button>
    </div>
  );
}
