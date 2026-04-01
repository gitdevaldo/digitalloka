'use client';

import { useState } from 'react';

type LoginErrorKind = 'input' | 'access' | 'limit' | 'service';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<{ message: string; kind: LoginErrorKind } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError({
          message: data.error || 'Unable to process sign-in.',
          kind: (data.kind as LoginErrorKind) || 'service',
        });
        return;
      }

      setSent(true);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Unexpected error occurred.',
        kind: 'service',
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center animate-pop-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-quaternary border-2 border-foreground shadow-pop flex items-center justify-center">
          <svg className="w-8 h-8 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold font-heading mb-2">Check your email!</h2>
        <p className="text-muted-foreground mb-4">
          We sent a magic link to <span className="text-accent font-bold">{email}</span>
        </p>
        <p className="text-muted-foreground text-sm">Click the link in your email to sign in</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-3 bg-input border-2 border-border rounded-lg text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-pop-accent transition-all duration-300"
        />
      </div>

      {error && (
        <div
          className={`p-4 rounded-lg border-2 text-sm font-medium ${
            error.kind === 'input'
              ? 'bg-tertiary/15 border-tertiary text-foreground'
              : error.kind === 'access'
              ? 'bg-secondary/10 border-secondary text-foreground'
              : error.kind === 'limit'
              ? 'bg-accent/10 border-accent text-foreground'
              : 'bg-secondary/10 border-secondary text-foreground'
          }`}
        >
          {error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full py-3 px-4 bg-accent text-white font-bold rounded-full border-2 border-foreground shadow-pop hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-pop-hover active:translate-x-[2px] active:translate-y-[2px] active:shadow-pop-active transition-all duration-300 ease-bounce disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-pop"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Send Magic Link
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        )}
      </button>
    </form>
  );
}
