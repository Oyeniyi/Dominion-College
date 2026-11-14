import React from 'react';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { EnquiriesManager } from '@/components/admin/EnquiriesManager';
import { getServerComponentAdminSession } from '@/server/auth/session';
import { listAdminEnquiries } from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export default async function AdminEnquiriesPage() {
  const session = await getServerComponentAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { items } = await listAdminEnquiries(session.user, { limit: 100 });

  return (
    <AdminShell
      session={session}
      title="Admissions Enquiries Inbox"
      subtitle="Review submitted parent and guardian enquiries and track follow-up status transitions."
    >
      <EnquiriesManager initialEnquiries={items} csrfToken={session.csrfToken} />
    </AdminShell>
  );
}
