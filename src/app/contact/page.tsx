import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, MessageCircle, ArrowRight, Compass } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { getPublicSiteSettings } from '@/server/services/cms-service';
import { buildWhatsAppClickToChatUrl } from '@/domain/validation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Us & Campus Location',
  description:
    'Contact Dominion College in Oba-Ile, Akure, Ondo State, Nigeria. Find our campus location, office hours, and admissions enquiry channels.',
};

export default async function ContactPage() {
  const settings = await getPublicSiteSettings();
  const whatsappUrl = buildWhatsAppClickToChatUrl(settings.whatsappNumber);

  return (
    <PageShell settings={settings}>
      <section className="bg-brand-primary-dark py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-amber-300">
            Reach Dominion College
          </span>
          <h1 className="mt-3 font-serif text-3xl font-extrabold sm:text-4xl">
            Contact Us &amp; Campus Directions
          </h1>
          <p className="mt-2 max-w-2xl text-base text-purple-100">
            Connect with the Admissions and Administrative Office at {settings.officialName}.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Contact Cards */}
          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card sm:p-8">
              <h2 className="font-serif text-2xl font-bold text-brand-primary-dark">
                Official School Contact Channels
              </h2>
              <p className="mt-2 text-sm text-brand-ink-muted">
                We welcome parents, guardians, and prospective families to visit our campus in
                Oba-Ile, Akure or submit an enquiry online.
              </p>

              <dl className="mt-6 space-y-5">
                {settings.address ? (
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-surface-tint text-brand-primary">
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                        Campus Address
                      </dt>
                      <dd className="mt-1 text-base font-semibold text-brand-primary-dark">
                        {settings.address}
                      </dd>
                    </div>
                  </div>
                ) : null}

                {settings.officeHours ? (
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-surface-tint text-brand-primary">
                      <Clock className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                        Administrative Office Hours
                      </dt>
                      <dd className="mt-1 text-base font-semibold text-brand-primary-dark">
                        {settings.officeHours}
                      </dd>
                    </div>
                  </div>
                ) : null}

                {settings.telephone ? (
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-surface-tint text-brand-primary">
                      <Phone className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                        Telephone
                      </dt>
                      <dd className="mt-1 text-base font-semibold text-brand-primary-dark">
                        <a href={`tel:${settings.telephone}`} className="hover:underline">
                          {settings.telephone}
                        </a>
                      </dd>
                    </div>
                  </div>
                ) : null}

                {settings.email ? (
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-surface-tint text-brand-primary">
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                        Email Address
                      </dt>
                      <dd className="mt-1 text-base font-semibold text-brand-primary-dark">
                        <a href={`mailto:${settings.email}`} className="hover:underline">
                          {settings.email}
                        </a>
                      </dd>
                    </div>
                  </div>
                ) : null}

                {whatsappUrl ? (
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                      <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
                        Direct WhatsApp Enquiry
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-base font-bold text-emerald-800 hover:underline"
                        >
                          <span>Start WhatsApp Conversation</span>
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </dd>
                    </div>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>

          {/* Location Guidance & Online Enquiry Card */}
          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card sm:p-8">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-accent text-white">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-serif text-2xl font-bold text-brand-primary-dark">
                Visiting Dominion College in Oba-Ile, Akure
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-ink-muted">
                Dominion College is situated in the serene residential and educational corridor of{' '}
                <strong>Oba-Ile, Akure, Ondo State, Nigeria</strong>. Prospective parents and
                guardians are encouraged to submit an online admissions enquiry ahead of their visit
                so our Admissions Officer can prepare a personalized campus tour.
              </p>

              {settings.directionsUrl && (
                <div className="mt-4">
                  <a
                    href={settings.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline"
                  >
                    <span>Open Campus Directions</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              )}

              <div className="mt-6 rounded-xl border border-brand-border bg-brand-surface-tint p-5">
                <h3 className="font-serif text-base font-bold text-brand-primary-dark">
                  Online Admissions &amp; General Enquiry Desk
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-brand-ink-muted">
                  Use our secure online enquiry form to reach the school administration directly
                  for Day Care, KG 1–2, Nursery 1–2, Primary 1–5, JSS 1–3, or SSS 1–3 admissions.
                </p>
                <div className="mt-4">
                  <Link
                    href="/admissions#enquiry-form"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-primary-dark"
                  >
                    <span>Open Online Enquiry Form</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
