'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginSchema } from '@/lib/validation/schemas';
import { useFormValidation } from '@/hooks/use-form-validation';
import { FieldError } from '@/components/ui/field-error';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const { getFieldError, validateField, markTouched, validateAll } = useFormValidation(loginSchema);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'forbidden') {
      setError('Your account is authenticated but not allowed to access the admin dashboard.');
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const { success } = validateAll({ email, next, mode: 'user' });
    if (!success) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, next, mode: 'user' }),
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
    <div className="login-page login-user">
      <main className="login-card">
        <span className="login-badge">User Dashboard</span>
        <h1 className="login-title">Welcome back to DigitalLoka</h1>
        <p className="login-desc">Sign in with a magic link — no password needed.</p>

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
              onChange={(e) => {
                setEmail(e.target.value);
                validateField('email', e.target.value, { email: e.target.value, next, mode: 'user' });
              }}
              onBlur={() => {
                markTouched('email');
                validateField('email', email, { email, next, mode: 'user' });
              }}
              placeholder="you@digitalloka.com"
              required
              className="login-input"
            />
            <FieldError message={getFieldError('email')} />
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
