'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setError(payload?.error?.detail || 'Invalid administrator credentials.');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Unable to reach authentication server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-brand-primary-dark via-brand-primary to-[#2B0A35] px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <img
            src="/images/dominion_logo.jpg"
            alt="Dominion College Crest"
            width={80}
            height={80}
            className="mx-auto h-20 w-20 rounded-full border-4 border-amber-400 bg-white object-contain p-1 shadow-lg"
          />
          <h1 className="mt-4 font-serif text-2xl font-extrabold text-white sm:text-3xl">
            Dominion College Administration
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
            Authorized School Staff Portal • Oba-Ile, Akure
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-purple-300/20 bg-white p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-brand-surface-tint px-3.5 py-2.5 text-xs font-medium text-brand-primary-dark">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
            <span>Protected by server-side session verification and RBAC controls.</span>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs font-medium text-red-900"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-semibold text-brand-ink">
                Administrator Email
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dominioncollege.edu.ng"
                className="mt-1.5 block w-full rounded-xl border border-brand-border px-3.5 py-2.5 text-sm text-brand-ink shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-semibold text-brand-ink"
              >
                Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1.5 block w-full rounded-xl border border-brand-border px-3.5 py-2.5 text-sm text-brand-ink shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-primary-dark disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-brand-border pt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

