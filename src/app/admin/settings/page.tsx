import React from 'react';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { SettingsManager } from '@/components/admin/SettingsManager';
import { getServerComponentAdminSession } from '@/server/auth/session';
import {
  getAdminInstitutionalContent,
  getAdminSiteSettings,
} from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const session = await getServerComponentAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const [settings, content] = await Promise.all([
    getAdminSiteSettings(session.user),
    getAdminInstitutionalContent(session.user),
  ]);

  return (
    <AdminShell
      session={session}
      title="School Settings & Institutional Content"
      subtitle="Update official contact channels, WhatsApp integration, and institutional narrative content."
    >
      <SettingsManager
        initialSettings={settings}
        initialContent={content}
        csrfToken={session.csrfToken}
      />
    </AdminShell>
  );
}
