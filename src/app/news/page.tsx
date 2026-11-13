import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { getPublicSiteSettings, listPublishedNews } from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'News & Announcements',
  description:
    'Read official announcements, academic calendar notices, and school news from Dominion College, Oba-Ile, Akure.',
};

export default function NewsPage() {
  const settings = getPublicSiteSettings();
  const { items: posts } = listPublishedNews({ limit: 24 });

  return (
    <PageShell settings={settings}>
      <section className="bg-brand-primary-dark py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-amber-300">
            <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
            Official School Updates
          </span>
          <h1 className="mt-3 font-serif text-3xl font-extrabold sm:text-4xl">
            News &amp; Announcements
          </h1>
          <p className="mt-2 max-w-2xl text-base text-purple-100">
            Official notices, admissions updates, and school life highlights from{' '}
            {settings.officialName}.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-brand-border bg-white p-10 text-center shadow-card">
            <Newspaper
              className="mx-auto h-10 w-10 text-brand-primary/60"
              aria-hidden="true"
            />
            <h2 className="mt-3 font-serif text-xl font-bold text-brand-primary-dark">
              No Published Announcements Yet
            </h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-brand-ink-muted">
              There are currently no published announcements. For immediate admissions enquiries,
              please visit our Admissions page.
            </p>
            <div className="mt-5">
              <Link
                href="/admissions#enquiry-form"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-primary-dark"
              >
                <span>Go to Admissions Enquiry</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
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
                    className="h-52 w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-brand-ink-muted">
                      <Calendar className="h-3.5 w-3.5 text-brand-accent" aria-hidden="true" />
                      <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                    <h2 className="mt-2.5 font-serif text-xl font-bold text-brand-primary-dark">
                      <Link href={`/news/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 border-t border-brand-border pt-4">
                    <Link
                      href={`/news/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:underline"
                    >
                      <span>Read Full Article</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
