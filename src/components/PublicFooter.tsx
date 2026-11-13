import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Shield, ArrowUpRight, MessageCircle } from 'lucide-react';
import type { PublicSiteSettingsProjection } from '@/domain/types';
import { buildWhatsAppClickToChatUrl } from '@/domain/validation';

interface PublicFooterProps {
  settings: PublicSiteSettingsProjection;
}

export function PublicFooter({ settings }: PublicFooterProps) {
  const currentYear = new Date().getFullYear();
  const whatsappUrl = buildWhatsAppClickToChatUrl(settings.whatsappNumber);

  return (
    <footer className="mt-auto border-t border-brand-primary/20 bg-brand-primary-dark text-purple-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Institutional Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={settings.logoUrl || '/images/dominion_logo.jpg'}
                alt={`${settings.officialName} Crest`}
                width={52}
                height={52}
                className="h-13 w-13 rounded-full border-2 border-amber-400 bg-white object-contain p-0.5"
              />
              <div>
                <h2 className="font-serif text-lg font-bold text-white">
                  {settings.officialName}
                </h2>
                <p className="text-xs font-medium text-amber-300">
                  {settings.address || 'Oba-Ile, Akure, Ondo State'}
                </p>
              </div>
            </div>
            <p className="rounded-lg border border-purple-700/60 bg-brand-primary/50 px-3 py-2 text-xs font-semibold tracking-wider text-amber-200">
              MOTTO: “{settings.motto}”
            </p>
            <p className="text-sm leading-relaxed text-purple-200">
              Secondary educational institution serving Junior Secondary (JSS 1–3) and Senior
              Secondary (SSS 1–3) students in Oba-Ile, Akure, Ondo State, Nigeria.
            </p>
          </div>

          {/* Column 2: Quick Navigation */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              Explore Dominion College
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="transition hover:text-white hover:underline">
                  About Dominion College
                </Link>
              </li>
              <li>
                <Link href="/academics" className="transition hover:text-white hover:underline">
                  Academic Programmes (JSS &amp; SSS)
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="transition hover:text-white hover:underline">
                  Admissions &amp; Enquiry Process
                </Link>
              </li>
              <li>
                <Link href="/news" className="transition hover:text-white hover:underline">
                  School News &amp; Announcements
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="transition hover:text-white hover:underline">
                  Campus Photo Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-white hover:underline">
                  Contact &amp; Directions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Admissions & Governance */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              Admissions &amp; Policies
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/admissions#enquiry-form"
                  className="inline-flex items-center gap-1 font-semibold text-amber-200 transition hover:text-white"
                >
                  <span>Submit Admissions Enquiry</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition hover:text-white hover:underline">
                  Privacy Notice &amp; Data Protection
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="transition hover:text-white hover:underline">
                  Authorized Staff Administration
                </Link>
              </li>
            </ul>
            <div className="mt-5 rounded-lg border border-purple-800 bg-purple-950/60 p-3 text-xs text-purple-200">
              <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                <Shield className="h-4 w-4 text-amber-400" aria-hidden="true" />
                <span>Child Protection &amp; Privacy</span>
              </div>
              <p className="mt-1 leading-relaxed">
                Enquiry submissions and student visuals are governed by school-approved data and
                child-safeguarding controls.
              </p>
            </div>
          </div>

          {/* Column 4: Official Contact Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              Contact Information
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-purple-100">
              {settings.address ? (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                  <span>{settings.address}</span>
                </li>
              ) : null}
              {settings.officeHours ? (
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                  <span>{settings.officeHours}</span>
                </li>
              ) : null}
              {settings.telephone ? (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                  <a
                    href={`tel:${settings.telephone}`}
                    className="transition hover:text-amber-300 hover:underline"
                  >
                    {settings.telephone}
                  </a>
                </li>
              ) : null}
              {settings.email ? (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="transition hover:text-amber-300 hover:underline"
                  >
                    {settings.email}
                  </a>
                </li>
              ) : null}
              {whatsappUrl ? (
                <li className="flex items-center gap-2.5">
                  <MessageCircle
                    className="h-4 w-4 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-300 transition hover:text-emerald-200 hover:underline"
                  >
                    Chat with Admissions on WhatsApp
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-purple-800/80 pt-6 text-xs text-purple-300 sm:flex sm:items-center sm:justify-between">
          <p>&copy; {currentYear} {settings.officialName}. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Official School Portal • Motto:{' '}
            <span className="text-amber-200">{settings.motto}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
