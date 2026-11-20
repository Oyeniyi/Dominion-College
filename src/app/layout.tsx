import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Dominion College | Oba-Ile, Akure, Ondo State',
    template: '%s | Dominion College, Oba-Ile, Akure',
  },
  description:
    'Official website of Dominion College, Oba-Ile, Akure, Ondo State, Nigeria. Co-educational Day Care, Kindergarten (KG 1–2), Nursery (1–2), Primary (1–5), Junior Secondary (JSS 1–3), and Senior Secondary (SSS 1–3). Motto: THE SECERET OF WISDOM IS GOD.',
  keywords: [
    'Dominion College',
    'Oba-Ile',
    'Akure',
    'Ondo State',
    'Primary School in Oba-Ile Akure',
    'Secondary School in Akure',
    'Day Care and Nursery Akure',
    'JSS',
    'SSS',
    'Admissions',
  ],
  icons: {
    icon: '/images/dominion_logo.jpg',
    apple: '/images/dominion_logo.jpg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Dominion College, Oba-Ile, Akure',
    title: 'Dominion College | Oba-Ile, Akure, Ondo State',
    description:
      'Co-educational Early Years, Primary, Junior Secondary, and Senior Secondary education in Oba-Ile, Akure, Ondo State. Guided by our motto: THE SECERET OF WISDOM IS GOD.',
    images: [
      {
        url: '/images/secondary-school-front-view-1.jpeg',
        width: 1200,
        height: 800,
        alt: 'Dominion College Campus Front View — Oba-Ile, Akure',
      },
      {
        url: '/images/dominion_logo.jpg',
        width: 500,
        height: 500,
        alt: 'Dominion College, Oba-Ile, Akure Official Crest',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dominion College | Oba-Ile, Akure, Ondo State',
    description:
      'Early Years, Primary (1–5), JSS (1–3), and SSS (1–3) education in Oba-Ile, Akure, Ondo State.',
    images: ['/images/secondary-school-front-view-1.jpeg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#FAF9FC] text-[#1F122B] antialiased selection:bg-brand-primary selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-primary-dark focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}

