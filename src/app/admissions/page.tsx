import React from 'react';
import type { Metadata } from 'next';
import { CheckCircle2, ClipboardList, School } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { AdmissionsEnquiryForm } from '@/components/AdmissionsEnquiryForm';
import {
  getPublicInstitutionalContent,
  getPublicSiteSettings,
} from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admissions & Online Enquiry',
  description:
    'Learn about the admissions process for Day Care, KG 1–2, Nursery 1–2, Primary 1–5, Junior Secondary (JSS 1–3), and Senior Secondary (SSS 1–3) at Dominion College, Oba-Ile, Akure.',
};

export default function AdmissionsPage() {
  const settings = getPublicSiteSettings();
  const content = getPublicInstitutionalContent();
  const { admissions } = content;

  return (
    <PageShell settings={settings}>
      {/* Page Header */}
      <section className="bg-brand-primary-dark py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-amber-300">
            Day Care • KG 1–2 • Nursery 1–2 • Primary 1–5 • JSS 1–3 • SSS 1–3
          </span>
          <h1 className="mt-3 font-serif text-3xl font-extrabold sm:text-4xl">
            Admissions at {settings.officialName}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-purple-100">{admissions.introduction}</p>
        </div>
      </section>

      {/* Admissions Process Steps & Eligibility */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary">
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              <span>How to Apply</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-brand-primary-dark sm:text-3xl">
              Step-by-Step Admissions Journey
            </h2>

            <ol className="space-y-4">
              {admissions.processSteps.map((step) => (
                <li
                  key={step.stepNumber}
                  className="flex items-start gap-4 rounded-2xl border border-brand-border bg-white p-5 shadow-card"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                    {step.stepNumber}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brand-primary-dark">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-brand-ink-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Entry Classes & Requirements Card */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card">
              <h3 className="font-serif text-xl font-bold text-brand-primary-dark">
                Available Entry Classes &amp; Requirements
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
                {admissions.applicationAvailabilityNote}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs font-semibold text-brand-primary-dark">
                <div className="flex items-center gap-2 rounded-lg bg-brand-surface-tint px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-accent" aria-hidden="true" />
                  <span>Day Care &amp; KG 1–2</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-brand-surface-tint px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-accent" aria-hidden="true" />
                  <span>Nursery 1–2</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-brand-surface-tint px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-accent" aria-hidden="true" />
                  <span>Primary 1–5</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-brand-surface-tint px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-accent" aria-hidden="true" />
                  <span>JSS 1–3 &amp; SSS 1–3</span>
                </div>
              </div>
              <ul className="mt-4 space-y-2 border-t border-brand-border pt-4 text-xs text-brand-ink-muted">
                {admissions.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-brand-border bg-brand-surface-tint p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white">
                <School className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-3 font-serif text-xl font-bold text-brand-primary-dark">
                Privacy &amp; Data Protection
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
                {admissions.privacyNoticeSummary}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Online Enquiry Form Section */}
      <section
        id="enquiry-form"
        className="border-t border-brand-border bg-brand-surface-tint/60 py-14"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AdmissionsEnquiryForm />
        </div>
      </section>
    </PageShell>
  );
}
