import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Dominion College | Oba-Ile, Akure, Ondo State',
    template: '%s | Dominion College, Oba-Ile, Akure',
  },
  description:
    'Official website of Dominion College, Oba-Ile, Akure, Ondo State, Nigeria. Co-educational Day and Boarding secondary school (JSS 1 – SSS 3). Motto: THE SECERET OF WISDOM IS GOD.',
  keywords: [
    'Dominion College',
    'Oba-Ile',
    'Akure',
    'Ondo State',
    'Secondary School in Akure',
    'Day and Boarding School',
    'JSS',
    'SSS',
    'Admissions',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Dominion College, Oba-Ile, Akure',
    title: 'Dominion College | Oba-Ile, Akure, Ondo State',
    description:
      'Co-educational Day and Boarding secondary education in Oba-Ile, Akure, Ondo State. Guided by our motto: THE SECERET OF WISDOM IS GOD.',
    images: [
      {
        url: '/images/dominion_logo.jpg',
        width: 500,
        height: 500,
        alt: 'Dominion College, Oba-Ile, Akure Official Crest',
      },
    ],
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

