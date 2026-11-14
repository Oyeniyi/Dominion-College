import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Eye, FileCheck, ArrowRight } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import {
  getPublicInstitutionalContent,
  getPublicSiteSettings,
} from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Privacy Notice & Child Safeguarding',
  description:
    'Read the Dominion College Privacy Notice regarding admissions enquiry data, student media protection, and data security.',
};

export default async function PrivacyPage() {
  const settings = await getPublicSiteSettings();
  const content = await getPublicInstitutionalContent();

  return (
    <PageShell settings={settings}>
      <section className="bg-brand-primary-dark py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-amber-300">
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            Data Protection &amp; Safeguarding
          </span>
          <h1 className="mt-3 font-serif text-3xl font-extrabold sm:text-4xl">
            Privacy Notice &amp; Child-Safety Policy
          </h1>
          <p className="mt-2 max-w-2xl text-base text-purple-100">
            How {settings.officialName} collects, protects, and uses personal information submitted
            through this website.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card sm:p-8">
          <h2 className="font-serif text-2xl font-bold text-brand-primary-dark">
            1. Overview &amp; Institutional Commitment
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-brand-ink-muted">
            {content.admissions.privacyNoticeFullText}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card">
            <Lock className="h-7 w-7 text-brand-primary" aria-hidden="true" />
            <h3 className="mt-3 font-serif text-lg font-bold text-brand-primary-dark">
              Data Minimization
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
              Our admissions enquiry form collects only parent contact details, intended entry
              level, and enquiry message. Sensitive medical or financial records are never requested
              online.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card">
            <Eye className="h-7 w-7 text-brand-primary" aria-hidden="true" />
            <h3 className="mt-3 font-serif text-lg font-bold text-brand-primary-dark">
              Access Control
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
              Submitted enquiries are stored securely in our private database and are accessible
              exclusively to authenticated and authorized Dominion College administrative staff.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card">
            <FileCheck className="h-7 w-7 text-brand-primary" aria-hidden="true" />
            <h3 className="mt-3 font-serif text-lg font-bold text-brand-primary-dark">
              Student Media Protection
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
              Photographs depicting identifiable students require documented school and parental
              authorization before they can be published in the public gallery.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface-tint p-6 sm:p-8">
          <h2 className="font-serif text-xl font-bold text-brand-primary-dark">
            2. Contacting Us About Your Data
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
            Parents and guardians may request updates or removal of their admissions enquiry record
            by contacting the Dominion College Administrative Office in Oba-Ile, Akure.
          </p>
          <div className="mt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-primary-dark"
            >
              <span>Contact School Administration</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
