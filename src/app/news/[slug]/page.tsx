import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { getServerComponentAdminSession } from '@/server/auth/session';
import { getPublishedNewsBySlug, getPublicSiteSettings } from '@/server/services/cms-service';
import { NotFoundError } from '@/domain/errors';

export const dynamic = 'force-dynamic';

interface NewsArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  try {
    const post = await getPublishedNewsBySlug(params.slug);
    const ogImage = post.featuredImage?.imageUrl || '/images/secondary-school-front-view-1.jpeg';
    return {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || undefined,
      openGraph: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt || undefined,
        images: [
          {
            url: ogImage,
            alt: post.featuredImage?.altText || post.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt || undefined,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: 'Announcement Not Found',
    };
  }
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const [settings, adminSession] = await Promise.all([
    getPublicSiteSettings(),
    getServerComponentAdminSession(),
  ]);
  let post;
  try {
    post = await getPublishedNewsBySlug(params.slug);
  } catch (err) {
    if (err instanceof NotFoundError) {
      notFound();
    }
    throw err;
  }

  return (
    <PageShell settings={settings}>
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to All Announcements</span>
          </Link>
          {adminSession && (
            <Link
              href={`/admin/news?slug=${encodeURIComponent(post.slug)}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-surface-tint px-3.5 py-1.5 text-xs font-bold text-brand-primary transition hover:bg-purple-100"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit Published Article</span>
            </Link>
          )}
        </div>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-brand-ink-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-surface-tint px-3 py-1 font-semibold text-brand-primary">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </span>
          </div>

          <h1 className="font-serif text-3xl font-extrabold leading-tight text-brand-primary-dark sm:text-4xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg font-medium leading-relaxed text-brand-ink-muted">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.featuredImage && (
          <div className="my-8 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
            <img
              src={post.featuredImage.imageUrl}
              alt={post.featuredImage.altText || post.title}
              width={900}
              height={500}
              className="max-h-[420px] w-full object-cover"
            />
          </div>
        )}

        <div
          className="article-prose mt-8 rounded-2xl border border-brand-border bg-white p-6 shadow-card sm:p-10"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-border bg-brand-surface-tint p-6">
          <div>
            <h2 className="font-serif text-lg font-bold text-brand-primary-dark">
              Have Questions About Admissions or School Programmes?
            </h2>
            <p className="text-sm text-brand-ink-muted">
              Reach out to our Admissions Office in Oba-Ile, Akure via our online enquiry form.
            </p>
          </div>
          <Link
            href="/admissions#enquiry-form"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-accent-hover"
          >
            <span>Make an Enquiry</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </article>
    </PageShell>
  );
}
