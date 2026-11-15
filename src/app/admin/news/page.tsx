import React from 'react';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { NewsManager } from '@/components/admin/NewsManager';
import { getServerComponentAdminSession } from '@/server/auth/session';
import { listAdminGalleryImages, listAdminNews } from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

interface AdminNewsPageProps {
  searchParams?: {
    edit?: string;
    slug?: string;
  };
}

export default async function AdminNewsPage({ searchParams }: AdminNewsPageProps) {
  const session = await getServerComponentAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const [{ items: posts }, { items: galleryImages }] = await Promise.all([
    listAdminNews(session.user, { limit: 100 }),
    listAdminGalleryImages(session.user, { limit: 100 }),
  ]);

  return (
    <AdminShell
      session={session}
      title="News & Announcements CMS"
      subtitle="Create, edit, preview, publish, unpublish, and archive school news and announcements."
    >
      <NewsManager
        initialPosts={posts}
        galleryImages={galleryImages}
        initialEditId={searchParams?.edit}
        initialEditSlug={searchParams?.slug}
        csrfToken={session.csrfToken}
      />
    </AdminShell>
  );
}
