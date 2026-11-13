'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, PhoneCall, MessageCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import type { PublicSiteSettingsProjection } from '@/domain/types';
import { buildWhatsAppClickToChatUrl } from '@/domain/validation';

interface PublicHeaderProps {
  settings: PublicSiteSettingsProjection;
}

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/academics', label: 'Academics' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/news', label: 'News & Updates' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact Us' },
];

export function PublicHeader({ settings }: PublicHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const whatsappUrl = buildWhatsAppClickToChatUrl(settings.whatsappNumber);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-white/95 backdrop-blur-md">
      {/* Top Institutional Utility Bar */}
      <div className="bg-brand-primary-dark text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-2.5 py-0.5 font-semibold tracking-wide text-amber-200">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              {settings.motto}
            </span>
            <span className="hidden text-purple-100 md:inline">
              {settings.address || 'Oba-Ile, Akure, Ondo State, Nigeria'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {settings.telephone ? (
              <a
                href={`tel:${settings.telephone}`}
                className="inline-flex items-center gap-1 text-purple-100 transition hover:text-amber-300"
              >
                <PhoneCall className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                <span>{settings.telephone}</span>
              </a>
            ) : (
              <Link
                href="/admissions#enquiry-form"
                className="text-purple-100 underline decoration-amber-400/70 underline-offset-2 hover:text-amber-200"
              >
                Online Admissions Desk Open
              </Link>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-emerald-300 transition hover:text-emerald-200"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
            )}
            <Link
              href="/admin/login"
              className="text-purple-200 transition hover:text-white"
              aria-label="Staff Portal Login"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3.5 focus:outline-none"
          aria-label={`${settings.officialName} — Home`}
        >
          <img
            src={settings.logoUrl || '/images/dominion_logo.jpg'}
            alt={`${settings.officialName} Crest`}
            width={56}
            height={56}
            className="h-12 w-12 rounded-full border-2 border-brand-primary/20 object-contain shadow-sm transition group-hover:border-brand-accent sm:h-14 sm:w-14"
          />
          <div>
            <span className="block font-serif text-lg font-extrabold tracking-tight text-brand-primary-dark sm:text-xl">
              {settings.officialName}
            </span>
            <span className="block text-xs font-medium text-brand-ink-muted">
              {settings.address || 'Oba-Ile, Akure, Ondo State'}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Primary Navigation" className="hidden lg:flex lg:items-center lg:gap-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-surface-tint text-brand-primary shadow-sm ring-1 ring-brand-primary/20'
                    : 'text-brand-ink-muted hover:bg-brand-surface-tint/70 hover:text-brand-primary-dark'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Primary CTA */}
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          <Link
            href="/admissions#enquiry-form"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-accent px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-accent-hover focus-visible:outline-brand-primary"
          >
            <span>Make an Enquiry</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-navigation"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-brand-border bg-brand-surface-tint p-2.5 text-brand-primary-dark transition hover:bg-purple-100"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-primary-navigation"
          aria-label="Mobile Navigation"
          className="border-t border-brand-border bg-white px-4 pb-6 pt-3 shadow-lg lg:hidden"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-[44px] items-center rounded-lg px-4 py-2.5 text-base font-semibold transition ${
                      isActive
                        ? 'bg-brand-surface-tint text-brand-primary ring-1 ring-brand-primary/20'
                        : 'text-brand-ink hover:bg-brand-surface-tint'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 border-t border-brand-border pt-4">
            <Link
              href="/admissions#enquiry-form"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-brand-accent px-4 py-3 text-center text-base font-bold text-white shadow-sm transition hover:bg-brand-accent-hover"
            >
              <span>Submit Admissions Enquiry</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
