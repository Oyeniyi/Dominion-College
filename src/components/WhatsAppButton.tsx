import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { PublicSiteSettingsProjection } from '@/domain/types';
import { buildWhatsAppClickToChatUrl } from '@/domain/validation';

interface WhatsAppButtonProps {
  settings: PublicSiteSettingsProjection;
}

export function WhatsAppButton({ settings }: WhatsAppButtonProps) {
  const whatsappUrl = buildWhatsAppClickToChatUrl(settings.whatsappNumber);
  if (!whatsappUrl) {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Dominion College Admissions on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-lg ring-2 ring-white transition hover:bg-emerald-800 focus-visible:outline-brand-accent"
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">Admissions WhatsApp</span>
    </a>
  );
}
