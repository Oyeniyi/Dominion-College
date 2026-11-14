import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Compass, HeartHandshake, ArrowRight, MapPin } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import {
  getPublicInstitutionalContent,
  getPublicSiteSettings,
} from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Dominion College',
  description:
    'Learn about the identity, mission, vision, core values, and educational divisions (Day Care, KG 1–2, Nursery 1–2, Primary 1–5, JSS 1–3, SSS 1–3) of Dominion College, Oba-Ile, Akure.',
};

export default async function AboutPage() {
  const settings = await getPublicSiteSettings();
  const content = await getPublicInstitutionalContent();

  return (
    <PageShell settings={settings}>
      {/* Page Header */}
      <section className="bg-brand-primary-dark py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Institutional Profile
          </span>
          <h1 className="mt-3 font-serif text-3xl font-extrabold sm:text-4xl">
            About {settings.officialName}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-purple-100">
            Day Care, KG 1–2, Nursery 1–2, Primary 1–5, Junior Secondary (JSS 1–3) &amp; Senior
            Secondary (SSS 1–3) in {settings.address || 'Oba-Ile, Akure, Ondo State'}.
          </p>
        </div>
      </section>

      {/* Identity & Crest */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <h2 className="font-serif text-2xl font-bold text-brand-primary-dark sm:text-3xl">
              Our Identity &amp; Heritage in Oba-Ile, Akure
            </h2>
            <p className="text-base leading-relaxed text-brand-ink-muted">
              {content.about.introduction}
            </p>
            {content.about.history && (
              <p className="text-base leading-relaxed text-brand-ink-muted">
                {content.about.history}
              </p>
            )}
            {content.about.philosophy && (
              <p className="text-base leading-relaxed text-brand-ink-muted">
                {content.about.philosophy}
              </p>
            )}

            <div className="rounded-2xl border border-brand-border bg-brand-surface-tint p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Official School Motto
              </div>
              <p className="mt-1 font-serif text-xl font-extrabold text-brand-primary-dark">
                “{settings.motto}”
              </p>
              <p className="mt-1 text-xs text-brand-ink-muted">
                Reflected on the official Dominion College crest with the open book and torch of
                knowledge.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-brand-border bg-white p-6 text-center shadow-card">
              <img
                src={settings.logoUrl || '/images/dominion_logo.jpg'}
                alt="Official Crest of Dominion College, Oba-Ile, Akure"
                width={260}
                height={260}
                className="mx-auto h-52 w-52 rounded-full border-4 border-brand-surface-tint object-contain"
              />
              <h3 className="mt-4 font-serif text-xl font-bold text-brand-primary-dark">
                {settings.officialName}
              </h3>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand-ink-muted">
                <MapPin className="h-4 w-4 text-brand-accent" aria-hidden="true" />
                {settings.address || 'Oba-Ile, Akure, Ondo State, Nigeria'}
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-brand-border pt-4 text-left text-xs">
                <div className="rounded-lg bg-brand-surface-tint p-3">
                  <dt className="font-semibold text-brand-ink-muted">Early Years &amp; Primary</dt>
                  <dd className="mt-0.5 font-bold text-brand-primary-dark">
                    Day Care, KG 1–2, Nursery 1–2, Primary 1–5
                  </dd>
                </div>
                <div className="rounded-lg bg-brand-surface-tint p-3">
                  <dt className="font-semibold text-brand-ink-muted">Secondary School</dt>
                  <dd className="mt-0.5 font-bold text-brand-primary-dark">
                    JSS 1–3 &amp; SSS 1–3
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="border-y border-brand-border bg-brand-surface-tint/70 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {content.about.mission && (
              <div className="rounded-2xl border border-brand-border bg-white p-8 shadow-card">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white">
                  <Compass className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-serif text-2xl font-bold text-brand-primary-dark">
                  Our Mission Statement
                </h2>
                <p className="mt-3 text-base leading-relaxed text-brand-ink-muted">
                  {content.about.mission}
                </p>
              </div>
            )}

            {content.about.vision && (
              <div className="rounded-2xl border border-brand-border bg-white p-8 shadow-card">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent text-white">
                  <HeartHandshake className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-serif text-2xl font-bold text-brand-primary-dark">
                  Our Vision Statement
                </h2>
                <p className="mt-3 text-base leading-relaxed text-brand-ink-muted">
                  {content.about.vision}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
            Guiding Principles
          </span>
          <h2 className="mt-1 font-serif text-2xl font-bold text-brand-primary-dark sm:text-3xl">
            Core Values at Dominion College
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.about.coreValues.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-brand-border bg-white p-6 shadow-card"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface-tint text-brand-primary">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-bold text-brand-primary-dark">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership & Learning Community */}
      {content.about.leadershipNote && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-brand-border bg-white p-8 shadow-card lg:p-10">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                  Student Care &amp; Leadership
                </span>
                <h2 className="font-serif text-2xl font-bold text-brand-primary-dark">
                  Dedicated Guidance Across Every Stage
                </h2>
                <p className="text-base leading-relaxed text-brand-ink-muted">
                  {content.about.leadershipNote}
                </p>
                <div className="pt-2">
                  <Link
                    href="/admissions#enquiry-form"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-primary-dark"
                  >
                    <span>Enquire About Admissions</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-5">
                <img
                  src="/placeholders/library-study.svg"
                  alt="Study and Library Environment Illustration"
                  width={500}
                  height={330}
                  className="w-full rounded-xl border border-brand-border object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
