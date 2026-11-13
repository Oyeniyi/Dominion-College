import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Inbox, Newspaper, Images, Settings, ArrowRight, FolderOpen } from 'lucide-react';
import { AdminShell } from '@/components/AdminShell';
import { getServerComponentAdminSession } from '@/server/auth/session';
import { getAdminDashboardOverview } from '@/server/services/cms-service';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const session = getServerComponentAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const summary = getAdminDashboardOverview(session.user);

  return (
    <AdminShell
      session={session}
      title="Administration Overview"
      subtitle="Manage admissions enquiries, school announcements, gallery media, and official Dominion College settings."
    >
      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
              New Enquiries
            </span>
            <Inbox className="h-5 w-5 text-brand-accent" aria-hidden="true" />
          </div>
          <p className="mt-3 font-serif text-3xl font-extrabold text-brand-primary-dark">
            {summary.newEnquiriesCount}
          </p>
          <p className="mt-1 text-xs text-brand-ink-muted">
            {summary.totalEnquiriesCount} total enquiries recorded
          </p>
        </div>

        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
              Published News
            </span>
            <Newspaper className="h-5 w-5 text-brand-primary" aria-hidden="true" />
          </div>
          <p className="mt-3 font-serif text-3xl font-extrabold text-brand-primary-dark">
            {summary.publishedNewsCount}
          </p>
          <p className="mt-1 text-xs text-brand-ink-muted">
            {summary.draftNewsCount} drafts awaiting publication
          </p>
        </div>

        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
              Published Gallery Media
            </span>
            <Images className="h-5 w-5 text-brand-primary" aria-hidden="true" />
          </div>
          <p className="mt-3 font-serif text-3xl font-extrabold text-brand-primary-dark">
            {summary.publishedGalleryCount}
          </p>
          <p className="mt-1 text-xs text-brand-ink-muted">
            {summary.totalGalleryCount} total gallery items
          </p>
        </div>

        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
              Gallery Albums
            </span>
            <FolderOpen className="h-5 w-5 text-brand-primary" aria-hidden="true" />
          </div>
          <p className="mt-3 font-serif text-3xl font-extrabold text-brand-primary-dark">
            {summary.albumCount}
          </p>
          <p className="mt-1 text-xs text-brand-ink-muted">Organized campus collections</p>
        </div>
      </div>

      {/* Quick Actions & Recent Enquiries */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-brand-primary-dark">
              Recent Admissions Enquiries
            </h2>
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline"
            >
              <span>Manage All Enquiries</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {summary.recentEnquiries.length === 0 ? (
            <p className="mt-6 text-sm text-brand-ink-muted">
              No admissions enquiries have been submitted yet.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-border text-left text-xs">
                <thead>
                  <tr className="text-brand-ink-muted">
                    <th className="py-2.5 pr-3 font-bold uppercase">Parent</th>
                    <th className="px-3 py-2.5 font-bold uppercase">Entry Class</th>
                    <th className="px-3 py-2.5 font-bold uppercase">Status</th>
                    <th className="py-2.5 pl-3 font-bold uppercase">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {summary.recentEnquiries.map((enq) => (
                    <tr key={enq.id}>
                      <td className="py-3 pr-3 font-semibold text-brand-ink">{enq.parentName}</td>
                      <td className="px-3 py-3">{enq.entryLevel}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-brand-surface-tint px-2.5 py-0.5 font-bold uppercase text-brand-primary">
                          {enq.status}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-brand-ink-muted">
                        {new Date(enq.createdAt).toLocaleDateString('en-NG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card">
            <h2 className="font-serif text-lg font-bold text-brand-primary-dark">
              CMS Quick Actions
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/admin/news"
                  className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-surface-tint/60 px-4 py-3 font-semibold text-brand-primary-dark transition hover:bg-brand-surface-tint"
                >
                  <span>Create or Publish News Article</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/gallery"
                  className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-surface-tint/60 px-4 py-3 font-semibold text-brand-primary-dark transition hover:bg-brand-surface-tint"
                >
                  <span>Manage Campus Gallery &amp; Media</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/settings"
                  className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-surface-tint/60 px-4 py-3 font-semibold text-brand-primary-dark transition hover:bg-brand-surface-tint"
                >
                  <span className="inline-flex items-center gap-2">
                    <Settings className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                    <span>Edit School Contact &amp; Content</span>
                  </span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
