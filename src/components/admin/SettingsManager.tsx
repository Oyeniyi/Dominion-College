'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';
import type { InstitutionalContent, SiteSettings } from '@/domain/types';

interface SettingsManagerProps {
  initialSettings: SiteSettings;
  initialContent: InstitutionalContent;
  csrfToken: string;
}

export function SettingsManager({
  initialSettings,
  initialContent,
  csrfToken,
}: SettingsManagerProps) {
  // Site Settings State
  const [officialName, setOfficialName] = useState(initialSettings.officialName);
  const [motto, setMotto] = useState(initialSettings.motto);
  const [address, setAddress] = useState(initialSettings.address || '');
  const [telephone, setTelephone] = useState(initialSettings.telephone || '');
  const [email, setEmail] = useState(initialSettings.email || '');
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings.whatsappNumber || '');
  const [officeHours, setOfficeHours] = useState(initialSettings.officeHours || '');
  const [defaultSeoTitle, setDefaultSeoTitle] = useState(initialSettings.defaultSeoTitle);
  const [defaultSeoDescription, setDefaultSeoDescription] = useState(
    initialSettings.defaultSeoDescription,
  );

  // Institutional Content State
  const [aboutIntro, setAboutIntro] = useState(initialContent.about.introduction);
  const [mission, setMission] = useState(initialContent.about.mission || '');
  const [vision, setVision] = useState(initialContent.about.vision || '');
  const [academicsIntro, setAcademicsIntro] = useState(initialContent.academics.introduction);
  const [admissionsIntro, setAdmissionsIntro] = useState(initialContent.admissions.introduction);

  const [savingSettings, setSavingSettings] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          officialName,
          motto,
          address: address || null,
          telephone: telephone || null,
          email: email || null,
          whatsappNumber: whatsappNumber || null,
          officeHours: officeHours || null,
          defaultSeoTitle,
          defaultSeoDescription,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setFeedback({
          type: 'err',
          text: payload?.error?.detail || 'Failed to update site settings.',
        });
        return;
      }

      setFeedback({ type: 'ok', text: 'Official school settings updated.' });
    } catch {
      setFeedback({ type: 'err', text: 'Network error while updating settings.' });
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSaveContent(e: React.FormEvent) {
    e.preventDefault();
    setSavingContent(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/v1/admin/content', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          about: {
            introduction: aboutIntro,
            mission: mission || null,
            vision: vision || null,
          },
          academics: {
            introduction: academicsIntro,
          },
          admissions: {
            introduction: admissionsIntro,
          },
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setFeedback({
          type: 'err',
          text: payload?.error?.detail || 'Failed to update institutional content.',
        });
        return;
      }

      setFeedback({ type: 'ok', text: 'Institutional page content updated.' });
    } catch {
      setFeedback({ type: 'err', text: 'Network error while updating content.' });
    } finally {
      setSavingContent(false);
    }
  }

  return (
    <div className="space-y-8">
      {feedback && (
        <div
          role="alert"
          className={`flex items-center gap-2 rounded-xl border p-4 text-sm font-medium ${
            feedback.type === 'ok'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : 'border-red-300 bg-red-50 text-red-900'
          }`}
        >
          {feedback.type === 'ok' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-700" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Form 1: Site Contact & Identity Settings */}
      <form
        onSubmit={handleSaveSettings}
        className="space-y-5 rounded-2xl border border-brand-border bg-white p-6 shadow-card sm:p-8"
      >
        <div>
          <h2 className="font-serif text-xl font-bold text-brand-primary-dark">
            1. School Contact Details, Motto &amp; Metadata
          </h2>
          <p className="mt-1 text-xs text-brand-ink-muted">
            Updates here reflect immediately across the public header, footer, home page, and
            contact page.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="set-school-name"
              className="block text-xs font-bold uppercase text-brand-ink"
            >
              Official School Name *
            </label>
            <input
              id="set-school-name"
              type="text"
              required
              value={officialName}
              onChange={(e) => setOfficialName(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="set-motto" className="block text-xs font-bold uppercase text-brand-ink">
              Official Motto *
            </label>
            <input
              id="set-motto"
              type="text"
              required
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="set-address"
              className="block text-xs font-bold uppercase text-brand-ink"
            >
              Campus Address *
            </label>
            <input
              id="set-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="set-hours" className="block text-xs font-bold uppercase text-brand-ink">
              Office Hours
            </label>
            <input
              id="set-hours"
              type="text"
              value={officeHours}
              onChange={(e) => setOfficeHours(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="set-phone" className="block text-xs font-bold uppercase text-brand-ink">
              Primary Telephone (Optional until confirmed)
            </label>
            <input
              id="set-phone"
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+234 803 000 0000"
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="set-whatsapp"
              className="block text-xs font-bold uppercase text-brand-ink"
            >
              WhatsApp Number (Enables public WhatsApp CTA when set)
            </label>
            <input
              id="set-whatsapp"
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+234 803 000 0000"
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="set-email" className="block text-xs font-bold uppercase text-brand-ink">
              Official Email Address
            </label>
            <input
              id="set-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@dominioncollege.edu.ng"
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="set-seo-title"
              className="block text-xs font-bold uppercase text-brand-ink"
            >
              Default SEO Title
            </label>
            <input
              id="set-seo-title"
              type="text"
              value={defaultSeoTitle}
              onChange={(e) => setDefaultSeoTitle(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="set-seo-desc"
            className="block text-xs font-bold uppercase text-brand-ink"
          >
            Default SEO &amp; Hero Description *
          </label>
          <textarea
            id="set-seo-desc"
            rows={2}
            required
            value={defaultSeoDescription}
            onChange={(e) => setDefaultSeoDescription(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={savingSettings}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
        >
          {savingSettings ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          <span>Save Site Settings</span>
        </button>
      </form>

      {/* Form 2: Institutional Page Content */}
      <form
        onSubmit={handleSaveContent}
        className="space-y-5 rounded-2xl border border-brand-border bg-white p-6 shadow-card sm:p-8"
      >
        <div>
          <h2 className="font-serif text-xl font-bold text-brand-primary-dark">
            2. About, Academics &amp; Admissions Institutional Copy
          </h2>
          <p className="mt-1 text-xs text-brand-ink-muted">
            Manage the narrative paragraphs displayed on the Home, About, Academics, and Admissions
            pages.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="cnt-mission"
              className="block text-xs font-bold uppercase text-brand-ink"
            >
              Mission Statement
            </label>
            <textarea
              id="cnt-mission"
              rows={3}
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="cnt-vision"
              className="block text-xs font-bold uppercase text-brand-ink"
            >
              Vision Statement
            </label>
            <textarea
              id="cnt-vision"
              rows={3}
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cnt-about" className="block text-xs font-bold uppercase text-brand-ink">
            About Dominion College Introduction *
          </label>
          <textarea
            id="cnt-about"
            rows={3}
            required
            value={aboutIntro}
            onChange={(e) => setAboutIntro(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="cnt-academics"
              className="block text-xs font-bold uppercase text-brand-ink"
            >
              Academics Overview Introduction *
            </label>
            <textarea
              id="cnt-academics"
              rows={3}
              required
              value={academicsIntro}
              onChange={(e) => setAcademicsIntro(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="cnt-admissions"
              className="block text-xs font-bold uppercase text-brand-ink"
            >
              Admissions Overview Introduction *
            </label>
            <textarea
              id="cnt-admissions"
              rows={3}
              required
              value={admissionsIntro}
              onChange={(e) => setAdmissionsIntro(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-brand-border px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingContent}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-accent-hover disabled:opacity-60"
        >
          {savingContent ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          <span>Save Institutional Content</span>
        </button>
      </form>
    </div>
  );
}
