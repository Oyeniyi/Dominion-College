'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import type { AdminUser } from '@/domain/types';

interface StaffManagerProps {
  initialUsers: AdminUser[];
  currentUserId: string;
  csrfToken: string;
}

export function StaffManager({
  initialUsers,
  currentUserId,
  csrfToken,
}: StaffManagerProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  // Change own password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Create new administrator account state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [confirmInitialPassword, setConfirmInitialPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  // Row-level state (toggle active / reset password)
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [resetTargetId, setResetTargetId] = useState<string | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  async function handleChangeOwnPassword(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (newPassword !== confirmNewPassword) {
      setFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/v1/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = await res.json();
      if (!res.ok) {
        const detail =
          payload?.error?.errors?.[0]?.message ||
          payload?.error?.detail ||
          'Could not update password.';
        setFeedback({ type: 'error', message: detail });
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setFeedback({
        type: 'success',
        message: 'Your administrator password has been updated.',
      });
    } catch {
      setFeedback({ type: 'error', message: 'Network error while updating password.' });
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (initialPassword !== confirmInitialPassword) {
      setFeedback({ type: 'error', message: 'Initial password and confirmation do not match.' });
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          displayName,
          email,
          password: initialPassword,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        const detail =
          payload?.error?.errors?.[0]?.message ||
          payload?.error?.detail ||
          'Could not create administrator account.';
        setFeedback({ type: 'error', message: detail });
        return;
      }

      setUsers((prev) => [...prev, payload.data as AdminUser]);
      setDisplayName('');
      setEmail('');
      setInitialPassword('');
      setConfirmInitialPassword('');
      setFeedback({
        type: 'success',
        message: `Administrator account created for ${payload.data.email}.`,
      });
    } catch {
      setFeedback({ type: 'error', message: 'Network error while creating administrator account.' });
    } finally {
      setCreatingUser(false);
    }
  }

  async function handleToggleActive(user: AdminUser) {
    setFeedback(null);
    setBusyUserId(user.id);
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setFeedback({
          type: 'error',
          message: payload?.error?.detail || 'Could not update account status.',
        });
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === user.id ? (payload.data as AdminUser) : u)));
      setFeedback({
        type: 'success',
        message: `${user.email} is now ${payload.data.isActive ? 'active' : 'disabled'}.`,
      });
    } catch {
      setFeedback({ type: 'error', message: 'Network error while updating account status.' });
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleResetUserPassword(e: React.FormEvent, targetUser: AdminUser) {
    e.preventDefault();
    setFeedback(null);
    setBusyUserId(targetUser.id);
    try {
      const res = await fetch(`/api/v1/admin/users/${targetUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ newPassword: resetPasswordValue }),
      });
      const payload = await res.json();
      if (!res.ok) {
        const detail =
          payload?.error?.errors?.[0]?.message ||
          payload?.error?.detail ||
          'Could not reset staff password.';
        setFeedback({ type: 'error', message: detail });
        return;
      }
      setResetTargetId(null);
      setResetPasswordValue('');
      setFeedback({
        type: 'success',
        message: `Password reset successfully for ${targetUser.email}.`,
      });
    } catch {
      setFeedback({ type: 'error', message: 'Network error while resetting password.' });
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <div className="space-y-8">
      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`flex items-start gap-2.5 rounded-xl border p-4 text-sm font-medium ${
            feedback.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : 'border-red-300 bg-red-50 text-red-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Change Own Password */}
        <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <KeyRound className="h-5 w-5 text-brand-primary" aria-hidden="true" />
            <h2 className="font-serif text-lg font-bold text-brand-primary-dark">
              Change Your Password
            </h2>
          </div>
          <p className="mt-1 text-xs text-brand-muted">
            Use at least 12 characters with uppercase, lowercase, a number, and a special character.
          </p>

          <form onSubmit={handleChangeOwnPassword} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="current-password"
                className="block text-xs font-semibold text-brand-ink"
              >
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm text-brand-ink focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="block text-xs font-semibold text-brand-ink">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm text-brand-ink focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-new-password"
                className="block text-xs font-semibold text-brand-ink"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm text-brand-ink focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
            >
              {changingPassword && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              <span>{changingPassword ? 'Updating...' : 'Update My Password'}</span>
            </button>
          </form>
        </section>

        {/* Add New Administrator */}
        <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <UserPlus className="h-5 w-5 text-brand-primary" aria-hidden="true" />
            <h2 className="font-serif text-lg font-bold text-brand-primary-dark">
              Add New Administrator
            </h2>
          </div>
          <p className="mt-1 text-xs text-brand-muted">
            Create an Authorized School Staff Portal account for another trusted school officer.
          </p>

          <form onSubmit={handleCreateAdmin} className="mt-5 space-y-4">
            <div>
              <label htmlFor="staff-name" className="block text-xs font-semibold text-brand-ink">
                Full Name / Title
              </label>
              <input
                id="staff-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Mrs. Adebayo (Admissions Officer)"
                className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm text-brand-ink focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label htmlFor="staff-email" className="block text-xs font-semibold text-brand-ink">
                Staff Email Address
              </label>
              <input
                id="staff-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admissions@dominioncollege.edu.ng"
                className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm text-brand-ink focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="staff-password"
                  className="block text-xs font-semibold text-brand-ink"
                >
                  Initial Password
                </label>
                <input
                  id="staff-password"
                  type="password"
                  required
                  minLength={12}
                  autoComplete="new-password"
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm text-brand-ink focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="staff-password-confirm"
                  className="block text-xs font-semibold text-brand-ink"
                >
                  Confirm Password
                </label>
                <input
                  id="staff-password-confirm"
                  type="password"
                  required
                  minLength={12}
                  autoComplete="new-password"
                  value={confirmInitialPassword}
                  onChange={(e) => setConfirmInitialPassword(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm text-brand-ink focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingUser}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-accent-hover disabled:opacity-60"
            >
              {creatingUser && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              <span>{creatingUser ? 'Creating...' : 'Create Administrator Account'}</span>
            </button>
          </form>
        </section>
      </div>

      {/* Staff Directory Table */}
      <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Users className="h-5 w-5 text-brand-primary" aria-hidden="true" />
          <h2 className="font-serif text-lg font-bold text-brand-primary-dark">
            Authorized School Staff Accounts ({users.length})
          </h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-border text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                <th className="py-3 pr-4">Staff Member</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Last Login</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                const isBusy = busyUserId === u.id;
                return (
                  <React.Fragment key={u.id}>
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-brand-ink">
                        {u.displayName}
                        {isSelf && (
                          <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-brand-primary-dark">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-brand-muted">{u.email}</td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-surface-tint px-2.5 py-0.5 text-xs font-semibold text-brand-primary-dark">
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          {u.roleCode}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-brand-muted">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={isSelf || isBusy}
                            onClick={() => handleToggleActive(u)}
                            title={isSelf ? 'You cannot disable your own account' : undefined}
                            className="rounded-lg border border-brand-border px-2.5 py-1 text-xs font-semibold text-brand-ink transition hover:bg-brand-surface-tint disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {u.isActive ? 'Disable' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => {
                              setResetTargetId(resetTargetId === u.id ? null : u.id);
                              setResetPasswordValue('');
                            }}
                            className="rounded-lg border border-brand-border px-2.5 py-1 text-xs font-semibold text-brand-primary transition hover:bg-brand-surface-tint disabled:opacity-50"
                          >
                            Reset Password
                          </button>
                        </div>
                      </td>
                    </tr>
                    {resetTargetId === u.id && (
                      <tr className="bg-brand-surface-tint/60">
                        <td colSpan={6} className="px-4 py-3">
                          <form
                            onSubmit={(e) => handleResetUserPassword(e, u)}
                            className="flex flex-wrap items-center gap-3"
                          >
                            <label
                              htmlFor={`reset-pw-${u.id}`}
                              className="text-xs font-semibold text-brand-ink"
                            >
                              New password for {u.email}:
                            </label>
                            <input
                              id={`reset-pw-${u.id}`}
                              type="password"
                              required
                              minLength={12}
                              placeholder="Min 12 chars (upper, lower, number, symbol)"
                              value={resetPasswordValue}
                              onChange={(e) => setResetPasswordValue(e.target.value)}
                              className="w-72 rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs text-brand-ink"
                            />
                            <button
                              type="submit"
                              disabled={isBusy}
                              className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-primary-dark disabled:opacity-60"
                            >
                              Save Password
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setResetTargetId(null);
                                setResetPasswordValue('');
                              }}
                              className="text-xs font-semibold text-brand-muted hover:text-brand-ink"
                            >
                              Cancel
                            </button>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

