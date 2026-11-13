'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react';
import type { PublicGalleryImageProjection } from '@/domain/types';

interface GalleryAlbumSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
}

interface GalleryViewerProps {
  albums: GalleryAlbumSummary[];
  images: PublicGalleryImageProjection[];
}

export function GalleryViewer({ albums, images }: GalleryViewerProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filteredImages =
    selectedAlbumId === 'all'
      ? images
      : images.filter((img) => img.albumId === selectedAlbumId);

  useEffect(() => {
    setActiveIndex(null);
  }, [selectedAlbumId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (activeIndex === null) return;
      if (e.key === 'Escape') {
        setActiveIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredImages.length,
        );
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + filteredImages.length) % filteredImages.length,
        );
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, filteredImages.length]);

  const activeImage = activeIndex !== null ? filteredImages[activeIndex] : null;

  return (
    <div>
      {/* Album Filter Pills */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div
          role="group"
          aria-label="Filter gallery images by album"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setSelectedAlbumId('all')}
            aria-pressed={selectedAlbumId === 'all'}
            className={`min-h-[40px] rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              selectedAlbumId === 'all'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'border border-brand-border bg-white text-brand-ink-muted hover:bg-brand-surface-tint'
            }`}
          >
            All Photos ({images.length})
          </button>
          {albums.map((alb) => (
            <button
              key={alb.id}
              type="button"
              onClick={() => setSelectedAlbumId(alb.id)}
              aria-pressed={selectedAlbumId === alb.id}
              className={`min-h-[40px] rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                selectedAlbumId === alb.id
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'border border-brand-border bg-white text-brand-ink-muted hover:bg-brand-surface-tint'
              }`}
            >
              {alb.title}
            </button>
          ))}
        </div>
      </div>

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <div className="rounded-2xl border border-brand-border bg-white p-10 text-center shadow-card">
          <Images className="mx-auto h-10 w-10 text-brand-primary/60" aria-hidden="true" />
          <h2 className="mt-3 font-serif text-xl font-bold text-brand-primary-dark">
            No Gallery Images Available
          </h2>
          <p className="mt-1 text-sm text-brand-ink-muted">
            Approved campus photographs for this album will appear here once published.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((img, idx) => (
            <div
              key={img.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card transition hover:border-brand-primary/40"
            >
              <button
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`View larger image: ${img.caption || img.altText}`}
                className="relative block overflow-hidden bg-brand-surface-tint text-left focus:outline-none"
              >
                <img
                  src={img.imageUrl}
                  alt={img.altText}
                  width={600}
                  height={400}
                  loading="lazy"
                  className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-lg bg-brand-primary-dark/85 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Inspect</span>
                </span>
              </button>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent">
                      {img.albumTitle || 'Campus Gallery'}
                    </span>
                    {img.contentStatus === 'placeholder' && (
                      <span className="rounded bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-brand-primary">
                        Placeholder Visual
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 font-serif text-base font-bold text-brand-primary-dark">
                    {img.caption || img.altText}
                  </h2>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accessible Lightbox Modal */}
      {activeImage && activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.caption || activeImage.altText}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-brand-primary-dark text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-800 px-5 py-3.5">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  {activeImage.caption || activeImage.altText}
                </h3>
                <p className="text-xs text-purple-200">
                  Image {activeIndex + 1} of {filteredImages.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                aria-label="Close image viewer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-900 text-white transition hover:bg-purple-800"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative flex items-center justify-center bg-black/40 p-4">
              <img
                src={activeImage.imageUrl}
                alt={activeImage.altText}
                className="max-h-[60vh] w-auto rounded-lg object-contain"
              />

              {filteredImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex(
                        (activeIndex - 1 + filteredImages.length) % filteredImages.length,
                      )
                    }
                    aria-label="Previous image"
                    className="absolute left-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary-dark/90 text-white shadow-lg transition hover:bg-brand-primary"
                  >
                    <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((activeIndex + 1) % filteredImages.length)}
                    aria-label="Next image"
                    className="absolute right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary-dark/90 text-white shadow-lg transition hover:bg-brand-primary"
                  >
                    <ChevronRight className="h-6 w-6" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            {activeImage.caption && (
              <div className="border-t border-purple-800 px-6 py-4 text-sm text-purple-100">
                {activeImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
