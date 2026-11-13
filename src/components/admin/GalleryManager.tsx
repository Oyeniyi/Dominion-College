'use client';

import React, { useState } from 'react';
import { Trash2, Upload, CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react';
import type {
  ContentVerificationStatus,
  GalleryAlbum,
  GalleryImage,
  PublicationStatus,
} from '@/domain/types';

type AdminGalleryImageView = Omit<GalleryImage, 'storageKey'>;

interface GalleryManagerProps {
  initialAlbums: GalleryAlbum[];
  initialImages: AdminGalleryImageView[];
  csrfToken: string;
}

const PLACEHOLDER_VISUALS = [
  { url: '/placeholders/campus-hero.svg', label: 'Campus Hero Illustration' },
  { url: '/placeholders/classroom-learning.svg', label: 'Classroom Learning Illustration' },
  { url: '/placeholders/science-lab.svg', label: 'Science Lab Illustration' },
  { url: '/placeholders/library-study.svg', label: 'Library & Study Illustration' },
  { url: '/placeholders/sports-activities.svg', label: 'Sports & Co-Curricular Illustration' },
];

export function GalleryManager({
  initialAlbums,
  initialImages,
  csrfToken,
}: GalleryManagerProps) {
  const [albums] = useState<GalleryAlbum[]>(initialAlbums);
  const [images, setImages] = useState<AdminGalleryImageView[]>(initialImages);

  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [albumId, setAlbumId] = useState<string>(initialAlbums[0]?.id ?? '');
  const [contentStatus, setContentStatus] = useState<ContentVerificationStatus>('placeholder');
  const [status, setStatus] = useState<PublicationStatus>('draft');
  const [schoolApproved, setSchoolApproved] = useState(true);
  const [identifiableStudents, setIdentifiableStudents] = useState(false);
  const [approvalReference, setApprovalReference] = useState('');
  const [placeholderUrl, setPlaceholderUrl] = useState('/placeholders/campus-hero.svg');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleAddImage(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      let res: Response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('altText', altText);
        formData.append('caption', caption);
        if (albumId) formData.append('albumId', albumId);
        formData.append('contentStatus', contentStatus);
        formData.append('status', status);
        formData.append('schoolApproved', String(schoolApproved));
        formData.append('identifiableStudents', String(identifiableStudents));
        if (approvalReference) formData.append('approvalReference', approvalReference);

        res = await fetch('/api/v1/admin/gallery/images', {
          method: 'POST',
          headers: { 'X-CSRF-Token': csrfToken },
          body: formData,
        });
      } else {
        res = await fetch('/api/v1/admin/gallery/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify({
            albumId: albumId || null,
            altText,
            caption: caption || null,
            contentStatus,
            status,
            schoolApproved,
            identifiableStudents,
            approvalReference: approvalReference || null,
            placeholderUrl,
          }),
        });
      }

      const payload = await res.json();
      if (!res.ok) {
        setFeedback({
          type: 'err',
          text: payload?.error?.detail || 'Failed to add gallery item.',
        });
        return;
      }

      const created: AdminGalleryImageView = payload.data;
      setImages((prev) => [created, ...prev]);
      setAltText('');
      setCaption('');
      setSelectedFile(null);
      setFeedback({ type: 'ok', text: `Gallery item created (${created.status}).` });
    } catch {
      setFeedback({ type: 'err', text: 'Network error while creating gallery item.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(img: AdminGalleryImageView) {
    setFeedback(null);
    const nextStatus: PublicationStatus = img.status === 'published' ? 'unpublished' : 'published';

    const res = await fetch(`/api/v1/admin/gallery/images/${img.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        status: nextStatus,
        schoolApproved: true,
      }),
    });

    const payload = await res.json();
    if (!res.ok) {
      setFeedback({
        type: 'err',
        text: payload?.error?.detail || 'Could not change publication state.',
      });
      return;
    }

    const updated: AdminGalleryImageView = payload.data;
    setImages((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setFeedback({
      type: 'ok',
      text: `Gallery item "${updated.caption || updated.altText}" is now ${updated.status}.`,
    });
  }

  async function handleDelete(imageId: string) {
    const res = await fetch(`/api/v1/admin/gallery/images/${imageId}`, {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrfToken },
    });
    if (res.ok) {
      setImages((prev) => prev.filter((item) => item.id !== imageId));
      setFeedback({ type: 'ok', text: 'Gallery item deleted.' });
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Form: Upload or Add Placeholder */}
      <div className="lg:col-span-5">
        <form
          onSubmit={handleAddImage}
          className="space-y-4 rounded-2xl border border-brand-border bg-white p-6 shadow-card"
        >
          <h2 className="font-serif text-xl font-bold text-brand-primary-dark">
            Add Gallery Visual or Upload Photo
          </h2>

          <div className="flex items-start gap-2 rounded-xl bg-brand-surface-tint p-3 text-xs text-brand-primary-dark">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
            <span>
              Child-safeguarding rule: Photos depicting identifiable students require documented
              approval reference before publication.
            </span>
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
            <label htmlFor="gal-alt" className="block text-xs font-bold uppercase text-brand-ink">
              Accessible Alt Text *
            </label>
            <input
              id="gal-alt"
              type="text"
              required
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="gal-album" className="block text-xs font-bold uppercase text-brand-ink">
              Album
            </label>
            <select
              id="gal-album"
              value={albumId}
              onChange={(e) => setAlbumId(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm"
            >
              <option value="">No Album</option>
              {albums.map((alb) => (
                <option key={alb.id} value={alb.id}>
                  {alb.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gal-file" className="block text-xs font-bold uppercase text-brand-ink">
              Upload Image File (JPEG, PNG, WebP, or Safe SVG)
            </label>
            <input
              id="gal-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-xs text-brand-ink-muted"
            />
          </div>

          {!selectedFile && (
            <div>
              <label
                htmlFor="gal-placeholder"
                className="block text-xs font-bold uppercase text-brand-ink"
              >
                Or Select Branded Placeholder Illustration
              </label>
              <select
                id="gal-placeholder"
                value={placeholderUrl}
                onChange={(e) => setPlaceholderUrl(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm"
              >
                {PLACEHOLDER_VISUALS.map((p) => (
                  <option key={p.url} value={p.url}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="gal-caption"
              className="block text-xs font-bold uppercase text-brand-ink"
            >
              Caption
            </label>
            <textarea
              id="gal-caption"
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="gal-status"
                className="block text-xs font-bold uppercase text-brand-ink"
              >
                Initial Status
              </label>
              <select
                id="gal-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PublicationStatus)}
                className="mt-1 block w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="gal-origin"
                className="block text-xs font-bold uppercase text-brand-ink"
              >
                Content Status
              </label>
              <select
                id="gal-origin"
                value={contentStatus}
                onChange={(e) => setContentStatus(e.target.value as ContentVerificationStatus)}
                className="mt-1 block w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm"
              >
                <option value="placeholder">Placeholder Visual</option>
                <option value="verified">Verified School Photo</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-brand-border bg-brand-surface-tint/60 p-3 text-xs">
            <label className="flex items-center gap-2 font-semibold text-brand-ink">
              <input
                type="checkbox"
                checked={schoolApproved}
                onChange={(e) => setSchoolApproved(e.target.checked)}
              />
              <span>Confirmed school-approved visual</span>
            </label>

            <label className="flex items-center gap-2 font-semibold text-brand-ink">
              <input
                type="checkbox"
                checked={identifiableStudents}
                onChange={(e) => setIdentifiableStudents(e.target.checked)}
              />
              <span>Depicts identifiable student(s)</span>
            </label>

            {identifiableStudents && (
              <div className="pt-1">
                <label
                  htmlFor="gal-consent-ref"
                  className="block text-[11px] font-bold uppercase text-brand-primary-dark"
                >
                  Parental / School Consent Reference *
                </label>
                <input
                  id="gal-consent-ref"
                  type="text"
                  value={approvalReference}
                  onChange={(e) => setApprovalReference(e.target.value)}
                  placeholder="e.g., CONSENT-2026-014"
                  className="mt-1 block w-full rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-xs"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" aria-hidden="true" />
            )}
            <span>Add to Gallery</span>
          </button>
        </form>
      </div>

      {/* Right Grid: Existing Gallery Items */}
      <div className="lg:col-span-7">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card"
            >
              <div>
                <img
                  src={img.publicUrl || '/placeholders/campus-hero.svg'}
                  alt={img.altText}
                  className="h-44 w-full bg-brand-surface-tint object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold uppercase text-brand-primary">
                      {img.status}
                    </span>
                    <span className="text-[11px] font-semibold uppercase text-brand-accent">
                      {img.contentStatus}
                    </span>
                  </div>
                  <h3 className="mt-2 font-serif text-base font-bold text-brand-primary-dark">
                    {img.caption || img.altText}
                  </h3>
                  <p className="mt-1 text-xs text-brand-ink-muted">{img.altText}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-brand-border px-4 py-3">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(img)}
                  className="text-xs font-bold text-brand-primary hover:underline"
                >
                  {img.status === 'published' ? 'Unpublish' : 'Publish to Website'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
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
    </div>
  );
}
