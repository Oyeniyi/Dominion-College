import React from 'react';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { NewsManager } from '@/components/admin/NewsManager';
import { getServerComponentAdminSession } from '@/server/auth/session';
import { listAdminNews } from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export default function AdminNewsPage() {
  const session = getServerComponentAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { items: posts } = listAdminNews(session.user, { limit: 100 });

  return (
    <AdminShell
      session={session}
      title="News & Announcements CMS"
      subtitle="Create, preview, publish, unpublish, and archive school news and announcements."
    >
      <NewsManager initialPosts={posts} csrfToken={session.csrfToken} />
    </AdminShell>
  );
}
