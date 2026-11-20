'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  Eye,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pencil,
  X,
} from 'lucide-react';
import type { GalleryImage, NewsArticle, PublicationStatus } from '@/domain/types';

interface NewsManagerProps {
  initialPosts: NewsArticle[];
  galleryImages?: GalleryImage[];
  initialEditId?: string;
  initialEditSlug?: string;
  csrfToken: string;
}

export function NewsManager({
  initialPosts,
  galleryImages = [],
  initialEditId,
  initialEditSlug,
  csrfToken,
}: NewsManagerProps) {
  const initialSelected = useMemo(() => {
    if (initialEditId) {
      return initialPosts.find((p) => p.id === initialEditId) ?? null;
    }
    if (initialEditSlug) {
      return initialPosts.find((p) => p.slug === initialEditSlug) ?? null;
    }
    return null;
  }, [initialPosts, initialEditId, initialEditSlug]);

  const editorRef = useRef<HTMLFormElement | null>(null);
  const [posts, setPosts] = useState<NewsArticle[]>(initialPosts);
  const [editingId, setEditingId] = useState<string | null>(initialSelected?.id ?? null);

  const [title, setTitle] = useState(initialSelected?.title ?? '');
  const [slug, setSlug] = useState(initialSelected?.slug ?? '');
  const [excerpt, setExcerpt] = useState(initialSelected?.excerpt ?? '');
  const [body, setBody] = useState(initialSelected?.body ?? '<p></p>');
  const [featuredImageId, setFeaturedImageId] = useState(
    initialSelected?.featuredImageId ?? ''
  );
  const [seoTitle, setSeoTitle] = useState(initialSelected?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(initialSelected?.seoDescription ?? '');
  const [status, setStatus] = useState<PublicationStatus>(initialSelected?.status ?? 'draft');

  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const eligibleImages = useMemo(
    () => galleryImages.filter((img) => img.status === 'published' && img.schoolApproved),
    [galleryImages]
  );

  function startNewPost() {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setBody('<p>Enter announcement details here...</p>');
    setFeaturedImageId('');
    setSeoTitle('');
    setSeoDescription('');
    setStatus('draft');
    setPreviewHtml(null);
    setFeedback(null);
  }

  function startEditPost(post: NewsArticle) {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt || '');
    setBody(post.body);
    setFeaturedImageId(post.featuredImageId || '');
    setSeoTitle(post.seoTitle || '');
    setSeoDescription(post.seoDescription || '');
    setStatus(post.status);
    setPreviewHtml(null);
    setFeedback(null);
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handlePreview() {
    setFeedback(null);
    const res = await fetch('/api/v1/admin/news/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        title,
        slug: slug || undefined,
        excerpt: excerpt || null,
        body,
        featuredImageId: featuredImageId || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        status,
      }),
    });

    const payload = await res.json();
    if (!res.ok) {
      setFeedback({
        type: 'err',
        text: payload?.error?.detail || 'Please complete required article fields to preview.',
      });
      return;
    }
    setPreviewHtml(payload.data.body);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const url = editingId ? `/api/v1/admin/news/${editingId}` : '/api/v1/admin/news';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          title,
          slug: slug || undefined,
          excerpt: excerpt || null,
          body,
          featuredImageId: featuredImageId || null,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          status,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setFeedback({
          type: 'err',
          text: payload?.error?.detail || 'Could not save news article.',
        });
        return;
      }

      const saved: NewsArticle = payload.data;
      if (editingId) {
        setPosts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      } else {
        setPosts((prev) => [saved, ...prev]);
        setEditingId(saved.id);
      }

      setSlug(saved.slug);
      setStatus(saved.status);
      setFeedback({
        type: 'ok',
        text: `Article "${saved.title}" saved (${saved.status}).`,
      });
    } catch {
      setFeedback({ type: 'err', text: 'Network error while saving news article.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(postId: string) {
    const res = await fetch(`/api/v1/admin/news/${postId}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrfToken },
    });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (editingId === postId) {
        startNewPost();
      }
      setFeedback({ type: 'ok', text: 'Article deleted.' });
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left List */}
      <div className="space-y-4 lg:col-span-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-brand-primary-dark">
            All Articles ({posts.length})
          </h2>
          <button
            type="button"
            onClick={startNewPost}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand-primary-dark"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>New Article</span>
          </button>
        </div>

        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`rounded-2xl border p-4 transition ${
                editingId === post.id
                  ? 'border-brand-primary bg-brand-surface-tint'
                  : 'border-brand-border bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold uppercase text-brand-primary">
                  {post.status}
                </span>
                <span className="text-[11px] text-brand-ink-muted">/{post.slug}</span>
              </div>
              <h3 className="mt-1.5 font-serif text-base font-bold text-brand-primary-dark">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-1 line-clamp-2 text-xs text-brand-ink-muted">{post.excerpt}</p>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-brand-border pt-2.5">
                <button
                  type="button"
                  onClick={() => startEditPost(post)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-surface-tint px-3 py-1.5 text-xs font-bold text-brand-primary transition hover:bg-purple-100"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(post.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Editor */}
      <div className="lg:col-span-7">
        <form
          ref={editorRef}
          onSubmit={handleSave}
          className="space-y-5 rounded-2xl border border-brand-border bg-white p-6 shadow-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border pb-4">
            <h2 className="font-serif text-xl font-bold text-brand-primary-dark">
              {editingId ? 'Edit News Article' : 'Create News Article'}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {editingId && status === 'published' && slug && (
                <Link
                  href={`/news/${encodeURIComponent(slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-surface-tint"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>View Live</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handlePreview}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface-tint px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-purple-100"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sanitized Preview</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={startNewPost}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-ink-muted hover:bg-gray-50"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>

          {feedback && (
            <div
              role="alert"
              className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-medium ${
                feedback.type === 'ok'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border-red-300 bg-red-50 text-red-900'
              }`}
            >
              {feedback.type === 'ok' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-700" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <div>
            <label htmlFor="news-title" className="block text-xs font-bold uppercase text-brand-ink">
              Article Title *
            </label>
            <input
              id="news-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="news-slug" className="block text-xs font-bold uppercase text-brand-ink">
                URL Slug (optional)
              </label>
              <input
                id="news-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-from-title"
                className="mt-1 block w-full rounded-xl border border-brand-border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="news-status"
                className="block text-xs font-bold uppercase text-brand-ink"
              >
                Publish Status
              </label>
              <select
                id="news-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PublicationStatus)}
                className="mt-1 block w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm font-semibold"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
                <option value="unpublished">Unpublished (Private)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="news-featured-image"
              className="block text-xs font-bold uppercase text-brand-ink"
            >
              Featured Gallery Image (optional, approved &amp; published only)
            </label>
            <select
              id="news-featured-image"
              value={featuredImageId}
              onChange={(e) => setFeaturedImageId(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm"
            >
              <option value="">No featured image</option>
              {eligibleImages.map((img) => (
                <option key={img.id} value={img.id}>
                  {img.caption || img.altText}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="news-summary"
              className="block text-xs font-bold uppercase text-brand-ink"
            >
              Short Excerpt
            </label>
            <textarea
              id="news-summary"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="news-body" className="block text-xs font-bold uppercase text-brand-ink">
              Article Body HTML (Sanitized Server-Side) *
            </label>
            <textarea
              id="news-body"
              rows={6}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="news-seo-title"
                className="block text-xs font-bold uppercase text-brand-ink"
              >
                SEO Title (optional)
              </label>
              <input
                id="news-seo-title"
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Defaults to article title"
                className="mt-1 block w-full rounded-xl border border-brand-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="news-seo-description"
                className="block text-xs font-bold uppercase text-brand-ink"
              >
                SEO Description (optional)
              </label>
              <input
                id="news-seo-description"
                type="text"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Defaults to article excerpt"
                className="mt-1 block w-full rounded-xl border border-brand-border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {previewHtml && (
            <div className="rounded-xl border border-brand-border bg-brand-surface-tint p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Sanitized Output Preview
              </div>
              <div
                className="article-prose mt-2 text-sm"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-accent-hover disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{editingId ? 'Save Article Changes' : 'Create Article'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
