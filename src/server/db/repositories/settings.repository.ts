import {
  BrandColors,
  InstitutionalContent,
  PublicSiteSettingsProjection,
  SiteSettings,
  SocialLink,
} from '@/domain/types';
import { getDatabase } from '../client';
import { DEFAULT_BRAND_COLORS, DEFAULT_INSTITUTIONAL_CONTENT } from '../seed-data';
import { parseJsonColumn, toIsoString } from '../types';

export async function fetchSiteSettingsRow(): Promise<Record<string, unknown> | null> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    SELECT * FROM site_settings WHERE singleton_id = 1 LIMIT 1
  `;
  return rows[0] ?? null;
}

export function mapPublicSiteSettings(
  row: Record<string, unknown> | null
): PublicSiteSettingsProjection {
  if (!row) {
    return {
      officialName: 'Dominion College, Oba-Ile, Akure',
      motto: 'THE SECERET OF WISDOM IS GOD',
      logoUrl: '/images/dominion_logo.jpg',
      brandColors: DEFAULT_BRAND_COLORS,
      telephone: null,
      email: 'info@dominioncollege.edu.ng',
      whatsappNumber: null,
      address: 'Oba-Ile, Akure, Ondo State, Nigeria',
      officeHours: 'Monday – Friday: 8:00 AM – 4:00 PM (WAT)',
      directionsUrl: null,
      socialLinks: [],
      defaultSeoTitle: 'Dominion College, Oba-Ile, Akure',
      defaultSeoDescription:
        'Official website of Dominion College, Oba-Ile, Akure, Ondo State, Nigeria.',
    };
  }

  return {
    officialName: String(row.official_name),
    motto: String(row.motto),
    logoUrl: String(row.logo_url),
    brandColors: parseJsonColumn<BrandColors>(row.brand_colors, DEFAULT_BRAND_COLORS),
    telephone: row.telephone ? String(row.telephone) : null,
    email: row.email ? String(row.email) : null,
    whatsappNumber: row.whatsapp_number ? String(row.whatsapp_number) : null,
    address: row.address ? String(row.address) : null,
    officeHours: row.office_hours ? String(row.office_hours) : null,
    directionsUrl: row.directions_url ? String(row.directions_url) : null,
    socialLinks: parseJsonColumn<SocialLink[]>(row.social_links, []),
    defaultSeoTitle: String(row.default_seo_title),
    defaultSeoDescription: String(row.default_seo_description),
  };
}

export function mapAdminSiteSettings(row: Record<string, unknown>): SiteSettings {
  return {
    singletonId: 1,
    ...mapPublicSiteSettings(row),
    updatedAt: toIsoString(row.updated_at),
  };
}

export async function fetchInstitutionalContent(): Promise<InstitutionalContent> {
  const sql = await getDatabase();
  const rows = await sql<{ institutional_content: unknown }[]>`
    SELECT institutional_content FROM site_settings WHERE singleton_id = 1 LIMIT 1
  `;
  const raw = rows[0]?.institutional_content;
  if (!raw) return DEFAULT_INSTITUTIONAL_CONTENT;

  const parsed = parseJsonColumn<Partial<InstitutionalContent>>(raw, {});
  return {
    ...DEFAULT_INSTITUTIONAL_CONTENT,
    ...parsed,
    about: {
      ...DEFAULT_INSTITUTIONAL_CONTENT.about,
      ...(parsed.about || {}),
    },
    academics: {
      ...DEFAULT_INSTITUTIONAL_CONTENT.academics,
      ...(parsed.academics || {}),
    },
    admissions: {
      ...DEFAULT_INSTITUTIONAL_CONTENT.admissions,
      ...(parsed.admissions || {}),
    },
  };
}

export async function updateSiteSettingsRow(params: {
  officialName: string;
  motto: string;
  brandColors: BrandColors;
  telephone: string | null;
  email: string | null;
  whatsappNumber: string | null;
  address: string | null;
  officeHours: string | null;
  directionsUrl: string | null;
  socialLinks: SocialLink[];
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  nowIso: string;
}): Promise<Record<string, unknown>> {
  const sql = await getDatabase();
  const rows = await sql<Record<string, unknown>[]>`
    UPDATE site_settings
    SET official_name = ${params.officialName},
        motto = ${params.motto},
        brand_colors = ${JSON.stringify(params.brandColors)}::jsonb,
        telephone = ${params.telephone},
        email = ${params.email},
        whatsapp_number = ${params.whatsappNumber},
        address = ${params.address},
        office_hours = ${params.officeHours},
        directions_url = ${params.directionsUrl},
        social_links = ${JSON.stringify(params.socialLinks)}::jsonb,
        default_seo_title = ${params.defaultSeoTitle},
        default_seo_description = ${params.defaultSeoDescription},
        updated_at = ${params.nowIso}
    WHERE singleton_id = 1
    RETURNING *
  `;
  return rows[0];
}

export async function updateInstitutionalContentRow(
  updated: InstitutionalContent,
  nowIso: string
): Promise<void> {
  const sql = await getDatabase();
  await sql`
    UPDATE site_settings
    SET institutional_content = ${JSON.stringify(updated)}::jsonb,
        updated_at = ${nowIso}
    WHERE singleton_id = 1
  `;
}
