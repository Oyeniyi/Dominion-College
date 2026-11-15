import React from 'react';
import Link from 'next/link';
import { Compass, Home, ArrowRight } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { getPublicSiteSettings } from '@/server/services/cms-service';
import { mapPublicSiteSettings } from '@/server/db/repositories/settings.repository';

export default async function NotFoundPage() {
  let settings;
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    settings = mapPublicSiteSettings(null);
  } else {
    try {
      settings = await getPublicSiteSettings();
    } catch {
      settings = mapPublicSiteSettings(null);
    }
  }

  return (
    <PageShell settings={settings}>
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-brand-border bg-white p-8 shadow-card sm:p-12">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-surface-tint text-brand-primary">
            <Compass className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-brand-accent">
            Error 404 • Page Not Found
          </p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold text-brand-primary-dark sm:text-4xl">
            We Could Not Find That Page
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-brand-ink-muted">
            The page you requested may have been moved or is no longer available on the{' '}
            {settings.officialName} website. Use the links below to continue exploring.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-primary-dark"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Return to Home Page</span>
            </Link>
            <Link
              href="/admissions#enquiry-form"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-accent-hover"
            >
              <span>Admissions Enquiry</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
