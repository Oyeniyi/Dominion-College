import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Baby, School, BookOpen, GraduationCap, Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import {
  getPublicInstitutionalContent,
  getPublicSiteSettings,
} from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Academics (Day Care, KG, Nursery, Primary, JSS & SSS)',
  description:
    'Explore Day Care, KG 1–2, Nursery 1–2, Primary 1–5, Junior Secondary (JSS 1–3), and Senior Secondary (SSS 1–3) programmes at Dominion College, Oba-Ile, Akure.',
};

export default function AcademicsPage() {
  const settings = getPublicSiteSettings();
  const content = getPublicInstitutionalContent();
  const { academics } = content;

  return (
    <PageShell settings={settings}>
      {/* Header */}
      <section className="bg-brand-primary-dark py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-amber-300">
            Academic Excellence • Day Care to SSS 3
          </span>
          <h1 className="mt-3 font-serif text-3xl font-extrabold sm:text-4xl">
            Academic Programmes at {settings.officialName}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-purple-100">{academics.introduction}</p>
        </div>
      </section>

      {/* Early Years Section */}
      {academics.earlyYears && (
        <section id="early-years" className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                <Baby className="h-4 w-4" aria-hidden="true" />
                <span>{academics.earlyYears.name}</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-brand-primary-dark sm:text-3xl">
                Nurturing Early Childhood Care &amp; Readiness
              </h2>
              <p className="text-base leading-relaxed text-brand-ink-muted">
                {academics.earlyYears.summary}
              </p>
            </div>

            <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card sm:p-8 lg:col-span-6">
              <h3 className="font-serif text-xl font-bold text-brand-primary-dark">
                Early Years Learning Areas
              </h3>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {academics.earlyYears.subjects.map((subject) => (
                  <li
                    key={subject}
                    className="flex items-center gap-2.5 rounded-xl border border-brand-border bg-brand-surface-tint/60 px-3.5 py-2.5 text-sm font-semibold text-brand-ink"
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-brand-accent"
                      aria-hidden="true"
                    />
                    <span>{subject}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Primary School Section */}
      {academics.primarySchool && (
        <section
          id="primary-school"
          className="border-y border-brand-border bg-brand-surface-tint/70 py-14"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-primary shadow-sm">
                  <School className="h-4 w-4" aria-hidden="true" />
                  <span>{academics.primarySchool.name}</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-brand-primary-dark sm:text-3xl">
                  Confident Literacy, Numeracy &amp; Character
                </h2>
                <p className="text-base leading-relaxed text-brand-ink-muted">
                  {academics.primarySchool.summary}
                </p>
              </div>

              <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card sm:p-8 lg:col-span-6">
                <h3 className="font-serif text-xl font-bold text-brand-primary-dark">
                  Primary 1–5 Core Subjects
                </h3>
                <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {academics.primarySchool.subjects.map((subject) => (
                    <li
                      key={subject}
                      className="flex items-center gap-2.5 rounded-xl border border-brand-border bg-brand-surface-tint/60 px-3.5 py-2.5 text-sm font-semibold text-brand-ink"
                    >
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-brand-primary"
                        aria-hidden="true"
                      />
                      <span>{subject}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Junior Secondary Section */}
      {academics.juniorSecondary && (
        <section id="junior-secondary" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-lg bg-brand-surface-tint px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-primary">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>{academics.juniorSecondary.name}</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-brand-primary-dark sm:text-3xl">
                Strong Foundations Across Core Secondary Subjects
              </h2>
              <p className="text-base leading-relaxed text-brand-ink-muted">
                {academics.juniorSecondary.summary}
              </p>
              <img
                src="/placeholders/classroom-learning.svg"
                alt="Junior Secondary Classroom Environment Illustration"
                width={560}
                height={360}
                className="mt-4 w-full rounded-2xl border border-brand-border object-cover shadow-sm"
              />
            </div>

            <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card sm:p-8 lg:col-span-6">
              <h3 className="font-serif text-xl font-bold text-brand-primary-dark">
                JSS Core Subject Areas
              </h3>
              <p className="mt-1 text-sm text-brand-ink-muted">
                Students in JSS 1, JSS 2, and JSS 3 engage in a broad foundational curriculum:
              </p>
              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {academics.juniorSecondary.subjects.map((subject) => (
                  <li
                    key={subject}
                    className="flex items-center gap-2.5 rounded-xl border border-brand-border bg-brand-surface-tint/60 px-3.5 py-2.5 text-sm font-semibold text-brand-ink"
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-brand-primary"
                      aria-hidden="true"
                    />
                    <span>{subject}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Senior Secondary Section */}
      {academics.seniorSecondary && (
        <section
          id="senior-secondary"
          className="border-y border-brand-border bg-brand-surface-tint/70 py-14"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-primary shadow-sm">
                  <GraduationCap className="h-4 w-4" aria-hidden="true" />
                  <span>{academics.seniorSecondary.name}</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-brand-primary-dark sm:text-3xl">
                  Specialized Academic Streams &amp; Senior Preparation
                </h2>
                <p className="text-base leading-relaxed text-brand-ink-muted">
                  {academics.seniorSecondary.summary}
                </p>
                {academics.curriculumOverview && (
                  <p className="text-sm leading-relaxed text-brand-ink-muted">
                    {academics.curriculumOverview}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card sm:p-8 lg:col-span-6">
                <h3 className="font-serif text-xl font-bold text-brand-primary-dark">
                  SSS Subject Groupings
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {academics.seniorSecondary.subjects.map((subject) => (
                    <li
                      key={subject}
                      className="flex items-center gap-2.5 rounded-xl border border-brand-border bg-brand-surface-tint/60 px-3.5 py-2.5 text-sm font-semibold text-brand-ink"
                    >
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-brand-primary"
                        aria-hidden="true"
                      />
                      <span>{subject}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Co-Curricular & Facilities */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-accent">
              <Compass className="h-4 w-4" aria-hidden="true" />
              <span>Beyond the Classroom</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-brand-primary-dark sm:text-3xl">
              Facilities, Teaching Approach &amp; Co-Curricular Life
            </h2>
            {academics.teachingApproach && (
              <p className="text-base leading-relaxed text-brand-ink-muted">
                {academics.teachingApproach}
              </p>
            )}
            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              <div className="rounded-xl border border-brand-border bg-white p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                  Learning Facilities
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-brand-ink-muted">
                  {academics.facilities.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-brand-border bg-white p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                  Co-Curricular Activities
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-brand-ink-muted">
                  {academics.extracurriculars.map((e) => (
                    <li key={e}>• {e}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/admissions#enquiry-form"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-accent-hover"
              >
                <span>Enquire About Academic Placement</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <img
              src="/placeholders/science-lab.svg"
              alt="Science and Practical Learning Illustration"
              width={520}
              height={340}
              className="w-full rounded-2xl border border-brand-border object-cover shadow-sm"
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
