import React from 'react';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { StaffManager } from '@/components/admin/StaffManager';
import { getServerComponentAdminSession } from '@/server/auth/session';
import { listAdminUsers } from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export default function AdminStaffPage() {
  const session = getServerComponentAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const users = listAdminUsers(session.user);

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

