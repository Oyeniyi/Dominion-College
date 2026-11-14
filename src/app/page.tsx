import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  Baby,
  School,
  MapPin,
  ShieldCheck,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import {
  getPublicInstitutionalContent,
  getPublicSiteSettings,
  listPublishedGalleryImages,
  listPublishedNews,
} from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const settings = await getPublicSiteSettings();
  const content = await getPublicInstitutionalContent();
  const latestNews = (await listPublishedNews({ limit: 3 })).items;
  const featuredGallery = (await listPublishedGalleryImages({ limit: 3 })).items;

  return (
    <PageShell settings={settings}>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary-dark via-brand-primary to-[#4B1357] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-amber-300/40 bg-purple-950/60 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                <span>MOTTO: {settings.motto}</span>
              </div>

              <h1 className="font-serif text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                {settings.officialName}
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-purple-100 sm:text-lg">
                {settings.defaultSeoDescription}
              </p>

              {/* Verified School Levels & Location Badges */}
              <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
                <div className="rounded-xl border border-purple-400/25 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <span className="block text-xs font-medium uppercase tracking-wider text-amber-300">
                    Early Years &amp; Primary
                  </span>
                  <span className="mt-0.5 block text-sm font-bold text-white">
                    Day Care, KG 1–2, Nursery 1–2, Primary 1–5
                  </span>
                </div>
                <div className="rounded-xl border border-purple-400/25 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <span className="block text-xs font-medium uppercase tracking-wider text-amber-300">
                    Secondary School
                  </span>
                  <span className="mt-0.5 block text-sm font-bold text-white">
                    JSS 1–3 &amp; SSS 1–3
                  </span>
                </div>
                <div className="rounded-xl border border-purple-400/25 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <span className="block text-xs font-medium uppercase tracking-wider text-amber-300">
                    Campus Location
                  </span>
                  <span className="mt-0.5 block text-sm font-bold text-white">
                    {settings.address || 'Oba-Ile, Akure, Ondo State'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/admissions#enquiry-form"
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-brand-accent px-6 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-brand-accent-hover"
                >
                  <span>Start Admissions Enquiry</span>
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/academics"
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-purple-300/50 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <span>Explore Academics</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-purple-950/60 p-3 shadow-2xl">
                <img
                  src="/placeholders/campus-hero.svg"
                  alt="Dominion College Campus Illustration — Oba-Ile, Akure"
                  width={600}
                  height={400}
                  className="h-auto w-full rounded-xl object-cover"
                />
                <div className="mt-3 flex items-center justify-between px-2 py-1 text-xs text-purple-200">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    Oba-Ile, Akure, Ondo State
                  </span>
                  <span className="rounded bg-purple-900/90 px-2 py-0.5 text-[11px] text-purple-200">
                    Campus Visual Preview
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Welcome & Core Values */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-surface-tint px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-primary">
              Welcome to {settings.officialName}
            </span>
            <h2 className="font-serif text-2xl font-bold text-brand-primary-dark sm:text-3xl">
              Academic Diligence, Moral Character, and Purposeful Growth
            </h2>
            <p className="text-base leading-relaxed text-brand-ink-muted">
              {content.about.introduction}
            </p>
            {content.about.philosophy && (
              <p className="text-base leading-relaxed text-brand-ink-muted">
                {content.about.philosophy}
              </p>
            )}
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:text-brand-primary-dark hover:underline"
              >
                <span>Read more about our mission and values</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-5">
            {content.about.coreValues.slice(0, 4).map((val) => (
              <div
                key={val.title}
                className="rounded-2xl border border-brand-border bg-white p-5 shadow-card"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface-tint text-brand-primary">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-base font-bold text-brand-primary-dark">
                  {val.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-ink-muted">
                  {val.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Academic Pathways: Early Years, Primary, JSS & SSS */}
      <section className="border-y border-brand-border bg-brand-surface-tint/70 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
              Educational Structure
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-brand-primary-dark sm:text-3xl">
              Continuous Learning from Day Care to SSS 3
            </h2>
            <p className="mt-2 text-base text-brand-ink-muted">
              {content.academics.introduction}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Early Years */}
            {content.academics.earlyYears && (
              <div className="flex flex-col justify-between rounded-2xl border border-brand-border bg-white p-6 shadow-card">
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent text-white">
                    <Baby className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-brand-primary-dark">
                    {content.academics.earlyYears.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
                    {content.academics.earlyYears.summary}
                  </p>
                </div>
                <div className="mt-6 border-t border-brand-border pt-4">
                  <Link
                    href="/academics#early-years"
                    className="inline-flex items-center gap-1 text-sm font-bold text-brand-primary hover:underline"
                  >
                    <span>Explore Early Years</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}

            {/* Primary School */}
            {content.academics.primarySchool && (
              <div className="flex flex-col justify-between rounded-2xl border border-brand-border bg-white p-6 shadow-card">
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white">
                    <School className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-brand-primary-dark">
                    {content.academics.primarySchool.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
                    {content.academics.primarySchool.summary}
                  </p>
                </div>
                <div className="mt-6 border-t border-brand-border pt-4">
                  <Link
                    href="/academics#primary-school"
                    className="inline-flex items-center gap-1 text-sm font-bold text-brand-primary hover:underline"
                  >
                    <span>Explore Primary 1–5</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}

            {/* Junior Secondary */}
            {content.academics.juniorSecondary && (
              <div className="flex flex-col justify-between rounded-2xl border border-brand-border bg-white p-6 shadow-card">
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-secondary text-white">
                    <BookOpen className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-brand-primary-dark">
                    {content.academics.juniorSecondary.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
                    {content.academics.juniorSecondary.summary}
                  </p>
                </div>
                <div className="mt-6 border-t border-brand-border pt-4">
                  <Link
                    href="/academics#junior-secondary"
                    className="inline-flex items-center gap-1 text-sm font-bold text-brand-primary hover:underline"
                  >
                    <span>View JSS Curriculum</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}

            {/* Senior Secondary */}
            {content.academics.seniorSecondary && (
              <div className="flex flex-col justify-between rounded-2xl border border-brand-border bg-white p-6 shadow-card">
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary-dark text-white">
                    <GraduationCap className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-brand-primary-dark">
                    {content.academics.seniorSecondary.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
                    {content.academics.seniorSecondary.summary}
                  </p>
                </div>
                <div className="mt-6 border-t border-brand-border pt-4">
                  <Link
                    href="/academics#senior-secondary"
                    className="inline-flex items-center gap-1 text-sm font-bold text-brand-primary hover:underline"
                  >
                    <span>Explore SSS Streams</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Latest News & Announcements */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              School Updates
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-brand-primary-dark sm:text-3xl">
              Latest News &amp; Announcements
            </h2>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-primary shadow-sm transition hover:bg-brand-surface-tint"
          >
            <span>View All Announcements</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {latestNews.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-brand-border bg-white p-8 text-center">
            <p className="text-base font-medium text-brand-ink-muted">
              No school announcements have been published yet. Please check back soon or contact the
              Admissions Office.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestNews.map((post) => (
              <article
                key={post.slug}
                className="flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card transition hover:border-brand-primary/40"
              >
                {post.featuredImage && (
                  <img
                    src={post.featuredImage.imageUrl}
                    alt={post.featuredImage.altText || post.title}
                    width={600}
                    height={340}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-brand-ink-muted">
                      <Calendar className="h-3.5 w-3.5 text-brand-accent" aria-hidden="true" />
                      <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                    <h3 className="mt-2 font-serif text-lg font-bold text-brand-primary-dark">
                      <Link href={`/news/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-brand-ink-muted">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3">
                    <Link
                      href={`/news/${post.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-brand-primary hover:underline"
                    >
                      <span>Read Announcement</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Campus Gallery Preview */}
      {featuredGallery.length > 0 && (
        <section className="border-t border-brand-border bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                  Visual Tour
                </span>
                <h2 className="mt-1 font-serif text-2xl font-bold text-brand-primary-dark sm:text-3xl">
                  Campus Life &amp; Learning Spaces
                </h2>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface-tint px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-purple-100"
              >
                <span>Open Full Gallery</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredGallery.map((img) => (
                <div
                  key={img.id}
                  className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface-bg shadow-sm"
                >
                  <img
                    src={img.imageUrl}
                    alt={img.altText}
                    width={600}
                    height={400}
                    className="h-52 w-full object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-base font-bold text-brand-primary-dark">
                        {img.caption || img.altText}
                      </h3>
                      {img.contentStatus === 'placeholder' && (
                        <span className="shrink-0 rounded bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-brand-primary">
                          Placeholder
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Admissions Call-to-Action Banner */}
      <section className="bg-brand-primary-dark py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-purple-700/60 bg-brand-primary/60 p-8 md:flex-row md:items-center">
            <div className="max-w-2xl space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Compass className="h-4 w-4" aria-hidden="true" />
                Admissions Enquiry Open
              </span>
              <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
                Ready to Discuss Admission for Your Child?
              </h2>
              <p className="text-sm leading-relaxed text-purple-100 sm:text-base">
                Submit an online enquiry for Day Care, KG 1–2, Nursery 1–2, Primary 1–5, Junior
                Secondary (JSS 1–3), or Senior Secondary (SSS 1–3) at Dominion College, Oba-Ile,
                Akure.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admissions#enquiry-form"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-brand-accent px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-accent-hover"
              >
                <span>Submit Admissions Enquiry</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-[48px] items-center rounded-xl border border-purple-300/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Visit or Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
