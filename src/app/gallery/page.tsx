import React from 'react';
import type { Metadata } from 'next';
import { Images } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { GalleryViewer } from '@/components/GalleryViewer';
import {
  getPublicSiteSettings,
  listPublishedAlbums,
  listPublishedGalleryImages,
} from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Campus Photo Gallery',
  description:
    'Explore campus buildings, assembly life, special programmes, school instrumentalists, and student activities at Dominion College, Oba-Ile, Akure.',
  openGraph: {
    images: [
      {
        url: '/images/students-in-school-temple.jpeg',
        width: 1200,
        height: 800,
        alt: 'Dominion College students gathered in the school temple',
      },
    ],
  },
};

export default async function GalleryPage() {
  const settings = await getPublicSiteSettings();
  const albums = await listPublishedAlbums();
  const { items: images } = await listPublishedGalleryImages({ limit: 48 });

  return (
    <PageShell settings={settings}>
      <section className="bg-brand-primary-dark py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-amber-300">
            <Images className="h-3.5 w-3.5" aria-hidden="true" />
            Campus Visuals
          </span>
          <h1 className="mt-3 font-serif text-3xl font-extrabold sm:text-4xl">
            School Photo Gallery
          </h1>
          <p className="mt-2 max-w-2xl text-base text-purple-100">
            Explore learning facilities, academic life, and campus spaces at {settings.officialName}.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <GalleryViewer albums={albums} images={images} />
      </section>
    </PageShell>
  );
}
