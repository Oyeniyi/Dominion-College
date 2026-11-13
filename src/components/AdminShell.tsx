'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Newspaper,
  Images,
  Settings,
  UserCog,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import type { AdminSessionUser } from '@/domain/types';

export interface AdminShellSession {
  user: AdminSessionUser;
  csrfToken: string;
}

interface AdminShellProps {
  session: AdminShellSession;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/enquiries', label: 'Admissions Enquiries', icon: Inbox },
  { href: '/admin/news', label: 'News & Announcements', icon: Newspaper },
  { href: '/admin/gallery', label: 'Gallery & Media', icon: Images },
  { href: '/admin/settings', label: 'Settings & Content', icon: Settings },
  { href: '/admin/staff', label: 'Staff & Security', icon: UserCog },
];

export function AdminShell({ session, title, subtitle, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch('/api/v1/admin/session', {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': session.csrfToken,
        },
      });
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F2F8] text-brand-ink">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 border-b border-brand-border bg-brand-primary-dark text-white shadow-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/images/dominion_logo.jpg"
              alt="Dominion College Crest"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-amber-400 bg-white object-contain p-0.5"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-bold text-white">
                  Dominion College CMS
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  {session.user.roleCode}
                </span>
              </div>
              <p className="text-xs text-purple-200">
                Signed in as <strong>{session.user.displayName}</strong> ({session.user.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/50 bg-purple-900/60 px-3 py-1.5 text-xs font-semibold text-purple-100 transition hover:bg-purple-800"
            >
              <span>View Public Site</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-accent px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-brand-accent-hover disabled:opacity-60"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          aria-label="Administration Navigation"
          className="border-t border-purple-800/80 bg-[#2D0A37]"
        >
          <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                    isActive
                      ? 'border-amber-400 bg-brand-primary/50 text-amber-300'
                      : 'border-transparent text-purple-200 hover:border-purple-500 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-extrabold text-brand-primary-dark sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-brand-ink-muted">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
