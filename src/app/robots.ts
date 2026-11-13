import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/academics', '/admissions', '/news', '/gallery', '/contact', '/privacy'],
        disallow: ['/admin', '/api/v1/admin'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

