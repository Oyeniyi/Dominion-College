import React from 'react';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { StaffManager } from '@/components/admin/StaffManager';
import { getServerComponentAdminSession } from '@/server/auth/session';
import { listAdminUsers } from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export default async function AdminStaffPage() {
  const session = await getServerComponentAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const users = await listAdminUsers(session.user);

  return (
    <AdminShell
      session={session}
      title="Authorized Staff & Password Security"
      subtitle="Change your administrator password, add authorized school staff accounts, and manage active portal access."
    >
      <StaffManager
        initialUsers={users}
        currentUserId={session.user.id}
        csrfToken={session.csrfToken}
      />
    </AdminShell>
  );
}

