'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Send, Loader2, Shield } from 'lucide-react';
import { APPROVED_ENTRY_LEVELS, type ApprovedEntryLevel } from '@/domain/types';
import type { FieldError } from '@/domain/errors';

export function AdmissionsEnquiryForm() {
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [entryLevel, setEntryLevel] = useState<ApprovedEntryLevel>('JSS 1');
  const [message, setMessage] = useState('');
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<{
    createdId: string;
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await fetch('/api/v1/admissions-enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentName,
          phone,
          email: email.trim() || null,
          entryLevel,
          message: message.trim() || null,
          privacyAcknowledged,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const errList: FieldError[] | undefined = payload?.error?.fieldErrors;
        if (Array.isArray(errList)) {
          const map: Record<string, string> = {};
          for (const item of errList) {
            if (item.field && item.message) {
              map[item.field] = item.message;
            }
          }
          setFieldErrors(map);
        }
        setGeneralError(
          payload?.error?.detail ||
            'Please review the highlighted fields and try submitting your enquiry again.',
        );
        return;
      }

      setSubmittedRef({
        createdId: payload.data.createdId,
        message: payload.data.message,
      });
    } catch {
      setGeneralError(
        'Unable to reach the server right now. Please check your connection and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedRef) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border-2 border-emerald-600/30 bg-emerald-50/70 p-6 sm:p-8"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            <h3 className="font-serif text-2xl font-bold text-emerald-950">
              Admissions Enquiry Received
            </h3>
            <p className="text-base leading-relaxed text-emerald-900">
              {submittedRef.message} Our designated admissions representative at Dominion College,
              Oba-Ile, Akure will review your enquiry and reach out via your provided contact
              details.
            </p>
            <div className="inline-block rounded-xl border border-emerald-700/30 bg-white px-4 py-2.5 text-sm text-emerald-950 shadow-sm">
              Enquiry Reference ID:{' '}
              <strong className="font-mono text-sm font-extrabold text-brand-primary-dark">
                {submittedRef.createdId}
              </strong>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedRef(null);
                  setMessage('');
                  setPrivacyAcknowledged(false);
                }}
                className="rounded-lg border border-emerald-700 px-4 py-2 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100"
              >
                Submit Another Enquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-2xl border border-brand-border bg-white p-6 shadow-card sm:p-8"
    >
      <div>
        <h3 className="font-serif text-2xl font-bold text-brand-primary-dark">
          Online Admissions Enquiry Form
        </h3>
        <p className="mt-1 text-sm text-brand-ink-muted">
          Complete the form below to request admissions details, schedule a campus visit in Oba-Ile,
          Akure, or ask questions about your child&apos;s intended entry class. Fields marked with{' '}
          <span className="font-bold text-red-700">*</span> are required.
        </p>
      </div>

      {generalError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden="true" />
          <div>
            <p className="font-semibold">Enquiry submission needs attention</p>
            <p className="mt-0.5">{generalError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Parent / Guardian Name */}
        <div>
          <label
            htmlFor="enquiry-parentName"
            className="block text-sm font-semibold text-brand-ink"
          >
            Parent / Guardian Full Name <span className="text-red-700">*</span>
          </label>
          <input
            id="enquiry-parentName"
            name="parentName"
            type="text"
            required
            autoComplete="name"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            aria-invalid={Boolean(fieldErrors.parentName)}
            aria-describedby={fieldErrors.parentName ? 'err-parentName' : undefined}
            placeholder="e.g., Mrs. Funmilayo Adeyemi"
            className="mt-1.5 block w-full rounded-xl border border-brand-border px-3.5 py-2.5 text-sm text-brand-ink shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
          {fieldErrors.parentName && (
            <p id="err-parentName" className="mt-1 text-xs font-medium text-red-700">
              {fieldErrors.parentName}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="enquiry-phone" className="block text-sm font-semibold text-brand-ink">
            Telephone Number <span className="text-red-700">*</span>
          </label>
          <input
            id="enquiry-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? 'err-phone' : undefined}
            placeholder="e.g., +234 803 000 0000"
            className="mt-1.5 block w-full rounded-xl border border-brand-border px-3.5 py-2.5 text-sm text-brand-ink shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
          {fieldErrors.phone && (
            <p id="err-phone" className="mt-1 text-xs font-medium text-red-700">
              {fieldErrors.phone}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="enquiry-email" className="block text-sm font-semibold text-brand-ink">
            Email Address{' '}
            <span className="text-xs font-normal text-brand-ink-muted">(Optional)</span>
          </label>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'err-email' : undefined}
            placeholder="parent@example.com"
            className="mt-1.5 block w-full rounded-xl border border-brand-border px-3.5 py-2.5 text-sm text-brand-ink shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
          {fieldErrors.email && (
            <p id="err-email" className="mt-1 text-xs font-medium text-red-700">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Desired Entry Level */}
        <div>
          <label
            htmlFor="enquiry-entryLevel"
            className="block text-sm font-semibold text-brand-ink"
          >
            Intended Entry Class <span className="text-red-700">*</span>
          </label>
          <select
            id="enquiry-entryLevel"
            name="entryLevel"
            value={entryLevel}
            onChange={(e) => setEntryLevel(e.target.value as ApprovedEntryLevel)}
            aria-invalid={Boolean(fieldErrors.entryLevel)}
            className="mt-1.5 block w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-ink shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          >
            {APPROVED_ENTRY_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
          {fieldErrors.entryLevel && (
            <p className="mt-1 text-xs font-medium text-red-700">{fieldErrors.entryLevel}</p>
          )}
        </div>
      </div>

      {/* Enquiry Message */}
      <div>
        <label htmlFor="enquiry-message" className="block text-sm font-semibold text-brand-ink">
          Message or Question{' '}
          <span className="text-xs font-normal text-brand-ink-muted">(Optional)</span>
        </label>
        <textarea
          id="enquiry-message"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'err-message' : undefined}
          placeholder="Share any questions regarding admission requirements, campus visits, or academic programmes..."
          className="mt-1.5 block w-full rounded-xl border border-brand-border px-3.5 py-2.5 text-sm text-brand-ink shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        />
        {fieldErrors.message && (
          <p id="err-message" className="mt-1 text-xs font-medium text-red-700">
            {fieldErrors.message}
          </p>
        )}
      </div>

      {/* Privacy Notice Acknowledgement */}
      <div className="rounded-xl border border-brand-border bg-brand-surface-tint/70 p-4">
        <div className="flex items-start gap-3">
          <input
            id="enquiry-privacyAcknowledged"
            name="privacyAcknowledged"
            type="checkbox"
            checked={privacyAcknowledged}
            onChange={(e) => setPrivacyAcknowledged(e.target.checked)}
            aria-invalid={Boolean(fieldErrors.privacyAcknowledged)}
            aria-describedby={fieldErrors.privacyAcknowledged ? 'err-privacy' : undefined}
            className="mt-1 h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
          />
          <div className="text-xs leading-relaxed text-brand-ink-muted">
            <label
              htmlFor="enquiry-privacyAcknowledged"
              className="cursor-pointer font-semibold text-brand-ink"
            >
              Privacy &amp; Data Protection Consent <span className="text-red-700">*</span>
            </label>
            <p className="mt-0.5">
              I acknowledge the{' '}
              <Link
                href="/privacy"
                className="font-semibold text-brand-primary underline hover:text-brand-primary-dark"
              >
                Dominion College Privacy Notice
              </Link>{' '}
              and consent to the processing of my contact details solely for responding to this
              admissions enquiry. Please do not include sensitive student medical or identity
              documents in this form.
            </p>
            {fieldErrors.privacyAcknowledged && (
              <p id="err-privacy" className="mt-1 font-semibold text-red-700">
                {fieldErrors.privacyAcknowledged}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-brand-ink-muted">
          <Shield className="h-4 w-4 text-brand-primary" aria-hidden="true" />
          <span>Protected by server-side validation and data-minimization safeguards.</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-brand-accent px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Submitting Enquiry...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>Submit Admissions Enquiry</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
