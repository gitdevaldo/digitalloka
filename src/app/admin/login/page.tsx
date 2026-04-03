'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/admin';

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'forbidden') {
      setError('Your account is authenticated but not allowed to access the admin dashboard.');
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, next, mode: 'admin' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to send magic link.');
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to send magic link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page login-admin">
      <main className="login-card">
        <span className="login-badge">Admin Access</span>
        <h1 className="login-title">Admin Login</h1>
        <p className="login-desc">Restricted access — admin credentials required.</p>

        {sent ? (
          <div className="login-message login-success">
            Magic link sent. Check your email and continue with the sign-in link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email" className="login-label">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@digitalloka.com"
              required
              className="login-input"
            />
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}

        {error && <div className="login-message login-error">{error}</div>}
      </main>
    </div>
  );
}
