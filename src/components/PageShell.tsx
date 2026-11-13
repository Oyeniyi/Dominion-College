import React from 'react';
import type { PublicSiteSettingsProjection } from '@/domain/types';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { WhatsAppButton } from './WhatsAppButton';

interface PageShellProps {
  settings: PublicSiteSettingsProjection;
  children: React.ReactNode;
}

export function PageShell({ settings, children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader settings={settings} />
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        {children}
      </main>
      <PublicFooter settings={settings} />
      <WhatsAppButton settings={settings} />
    </div>
  );
}
