'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Inbox } from 'lucide-react';
import type { AdmissionsEnquiry, EnquiryStatus } from '@/domain/types';

interface EnquiriesManagerProps {
  initialEnquiries: AdmissionsEnquiry[];
  csrfToken: string;
}

const ALLOWED_TRANSITIONS: Record<EnquiryStatus, EnquiryStatus[]> = {
  new: ['new', 'contacted', 'resolved', 'archived'],
  contacted: ['contacted', 'resolved', 'archived', 'new'],
  resolved: ['resolved', 'contacted', 'archived'],
  archived: ['archived', 'contacted', 'resolved'],
};

export function EnquiriesManager({ initialEnquiries, csrfToken }: EnquiriesManagerProps) {
  const [enquiries, setEnquiries] = useState<AdmissionsEnquiry[]>(initialEnquiries);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(initialEnquiries[0]?.id ?? null);
  const [targetStatus, setTargetStatus] = useState<EnquiryStatus>(
    initialEnquiries[0]?.status ?? 'new',
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const filtered =
    statusFilter === 'all' ? enquiries : enquiries.filter((e) => e.status === statusFilter);

  const selected = enquiries.find((e) => e.id === selectedId) ?? null;

  function selectEnquiry(enq: AdmissionsEnquiry) {
    setSelectedId(enq.id);
    setTargetStatus(enq.status);
    setFeedback(null);
  }

  async function handleSaveStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/v1/admin/enquiries/${selected.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          status: targetStatus,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setFeedback({
          type: 'err',
          text: payload?.error?.detail || 'Could not update enquiry status.',
        });
        return;
      }

      const updated: AdmissionsEnquiry = payload.data;
      setEnquiries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setFeedback({
        type: 'ok',
        text: `Enquiry for ${updated.parentName} updated to ${updated.status}.`,
      });
    } catch {
      setFeedback({ type: 'err', text: 'Network error while updating enquiry.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'contacted', 'resolved', 'archived'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              statusFilter === st
                ? 'bg-brand-primary text-white'
                : 'border border-brand-border bg-white text-brand-ink-muted hover:bg-brand-surface-tint'
            }`}
          >
            {st} (
            {st === 'all'
              ? enquiries.length
              : enquiries.filter((item) => item.status === st).length}
            )
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-brand-border bg-white p-10 text-center shadow-card">
          <Inbox className="mx-auto h-8 w-8 text-brand-primary/60" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-brand-ink-muted">
            No admissions enquiries match the selected filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Enquiry List */}
          <div className="space-y-3 lg:col-span-6">
            {filtered.map((enq) => {
              const isSelected = enq.id === selectedId;
              return (
                <button
                  key={enq.id}
                  type="button"
                  onClick={() => selectEnquiry(enq)}
                  className={`block w-full rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-brand-primary bg-brand-surface-tint shadow-sm'
                      : 'border-brand-border bg-white hover:border-brand-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-brand-primary-dark">
                      {enq.entryLevel}
                    </span>
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold uppercase text-brand-primary">
                      {enq.status}
                    </span>
                  </div>
                  <div className="mt-1 font-serif text-base font-bold text-brand-ink">
                    {enq.parentName}
                  </div>
                  <div className="mt-0.5 text-xs text-brand-ink-muted">
                    {enq.phone} {enq.email ? `• ${enq.email}` : ''}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail & Status Update Panel */}
          <div className="lg:col-span-6">
            {selected ? (
              <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card">
                <div className="flex items-center justify-between border-b border-brand-border pb-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand-accent">
                      {selected.id}
                    </span>
                    <h2 className="font-serif text-xl font-bold text-brand-primary-dark">
                      {selected.parentName}
                    </h2>
                  </div>
                  <span className="rounded-full bg-brand-surface-tint px-3 py-1 text-xs font-bold uppercase text-brand-primary">
                    {selected.status}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="font-bold text-brand-ink-muted">Phone Number</dt>
                    <dd className="mt-0.5 font-semibold text-brand-ink">{selected.phone}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-brand-ink-muted">Email Address</dt>
                    <dd className="mt-0.5 font-semibold text-brand-ink">
                      {selected.email || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-brand-ink-muted">Intended Entry Class</dt>
                    <dd className="mt-0.5 font-semibold text-brand-ink">{selected.entryLevel}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-brand-ink-muted">Submitted At</dt>
                    <dd className="mt-0.5 font-semibold text-brand-ink">
                      {new Date(selected.createdAt).toLocaleString('en-NG')}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 rounded-xl bg-brand-surface-tint/70 p-4 text-sm text-brand-ink">
                  <div className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                    Enquiry Message
                  </div>
                  <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                    {selected.message || 'No additional message provided.'}
                  </p>
                </div>

                {feedback && (
                  <div
                    role="alert"
                    className={`mt-4 flex items-center gap-2 rounded-xl border p-3 text-xs font-medium ${
                      feedback.type === 'ok'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                        : 'border-red-300 bg-red-50 text-red-900'
                    }`}
                  >
                    {feedback.type === 'ok' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-700" />
                    )}
                    <span>{feedback.text}</span>
                  </div>
                )}

                <form
                  onSubmit={handleSaveStatus}
                  className="mt-5 space-y-4 border-t border-brand-border pt-4"
                >
                  <div>
                    <label
                      htmlFor="enq-status-select"
                      className="block text-xs font-bold uppercase tracking-wider text-brand-ink-muted"
                    >
                      Enquiry Status Transition
                    </label>
                    <select
                      id="enq-status-select"
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value as EnquiryStatus)}
                      className="mt-1.5 block w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm font-semibold uppercase text-brand-ink"
                    >
                      {ALLOWED_TRANSITIONS[selected.status].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Save Enquiry Status</span>
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
