import React from 'react';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { getServerComponentAdminSession } from '@/server/auth/session';
import { listAdminAlbums, listAdminGalleryImages } from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  const session = await getServerComponentAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const [albums, { items: images }] = await Promise.all([
    listAdminAlbums(session.user),
    listAdminGalleryImages(session.user, { limit: 100 }),
  ]);

  return (
    <AdminShell
      session={session}
      title="Gallery & Media CMS"
      subtitle="Upload campus visuals, manage placeholder illustrations, and enforce child-safety media approvals."
    >
      <GalleryManager
        initialAlbums={albums}
        initialImages={images}
        csrfToken={session.csrfToken}
      />
    </AdminShell>
  );
}
