/**
 * Shared Domain Validation, Normalization, and Output Encoding Rules
 * Adheres to AE-05, AE-13, AE-18, SEC-06, SEC-07, SEC-08, SEC-14, and FR-04–FR-08.
 */

import {
  APPROVED_ENTRY_LEVELS,
  ApprovedEntryLevel,
  ContentVerificationStatus,
  EnquiryStatus,
  InstitutionalContent,
  PublicationStatus,
  SocialLink,
} from './types';
import { BadRequestError, FieldError, ValidationError } from './errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/**
 * Normalizes a phone number while preserving international dialing digits.
 */
export function normalizePhoneNumber(raw: string): string {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  return hasPlus ? `+${digits}` : digits;
}

export function isValidPhoneNumber(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Validates and formats an international number for WhatsApp click-to-chat (FR-05).
 * Returns digits-only international string (e.g., "2348030000000") or null if invalid/unset.
 */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15 || /^0+$/.test(digits)) {
    return null;
  }
  return digits;
}

/**
 * Constructs a verified WhatsApp click-to-chat URL (FR-05, AE-13).
 * Returns null if no valid configured school WhatsApp number exists; never guesses a number.
 */
export function buildWhatsAppClickToChatUrl(
  configuredNumber: string | null | undefined,
  prefilledMessage = 'Hello Dominion College. I would like to enquire about admission and receive more information about the school.'
): string | null {
  const validDigits = normalizeWhatsAppNumber(configuredNumber);
  if (!validDigits) {
    return null;
  }
  const encodedText = encodeURIComponent(prefilledMessage.trim());
  return `https://wa.me/${validDigits}?text=${encodedText}`;
}

/**
 * Validates that a URL uses a safe navigation scheme (https:, http:, or relative /).
 * Rejects javascript:, data:, vbscript:, file:, etc. (SEC-07, SEC-14).
 */
export function isSafeNavigationUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Sanitizes rich-text HTML at the trusted server boundary (FR-06, SEC-07).
 * Strips <script>, <iframe>, <object>, <embed>, <style>, <form>, inline event handlers (on*),
 * and unsafe URI schemes (javascript:, data:, vbscript:).
 */
export function sanitizeRichTextHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  let cleaned = rawHtml
    // Remove dangerous tag blocks completely
    .replace(/<(script|iframe|object|embed|style|form|meta|link|base|applet)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Remove self-closing or unclosed dangerous tags
    .replace(/<\/?(script|iframe|object|embed|style|form|meta|link|base|applet|input|button|textarea|select)\b[^>]*>/gi, '')
    // Remove inline event handlers like onclick=, onerror=, onload=
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Neutralize javascript:, vbscript:, data: in href/src/action attributes
    .replace(
      /\b(href|src|xlink:href|action|formaction)\s*=\s*(?:"\s*(?:javascript|vbscript|data):[^"]*"|'\s*(?:javascript|vbscript|data):[^']*'|(?:\s*(?:javascript|vbscript|data):[^\s>]+))/gi,
      '$1="#"'
    );

  return cleaned.trim();
}

export interface ValidatedEnquiryInput {
  parentName: string;
  phone: string;
  email: string | null;
  entryLevel: ApprovedEntryLevel;
  message: string | null;
  privacyAcknowledged: true;
  idempotencyKey: string | null;
}

const PROHIBITED_ENQUIRY_KEYS = new Set([
  'studentName',
  'studentId',
  'medicalHistory',
  'medicalDetails',
  'passportNumber',
  'nationalId',
  'birthCertificate',
  'bloodGroup',
]);

/**
 * Validates public admissions enquiry payload (FR-04, SEC-06, SEC-08).
 * Enforces data minimization and rejects prohibited sensitive student fields.
 */
export function validateEnquiryCreateInput(payload: unknown): ValidatedEnquiryInput {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ValidationError('Enquiry submission must be a valid JSON object.');
  }

  const record = payload as Record<string, unknown>;
  const fieldErrors: FieldError[] = [];

  for (const key of Object.keys(record)) {
    if (PROHIBITED_ENQUIRY_KEYS.has(key)) {
      fieldErrors.push({
        field: key,
        code: 'PROHIBITED_SENSITIVE_FIELD',
        message: 'Do not submit sensitive student identity or medical information in the enquiry form.',
      });
    }
  }

  const parentName = typeof record.parentName === 'string' ? record.parentName.trim() : '';
  if (!parentName) {
    fieldErrors.push({
      field: 'parentName',
      code: 'REQUIRED',
      message: 'Enter the parent or guardian name.',
    });
  } else if (parentName.length < 2 || parentName.length > 120) {
    fieldErrors.push({
      field: 'parentName',
      code: 'INVALID_LENGTH',
      message: 'Parent or guardian name must be between 2 and 120 characters.',
    });
  }

  const rawPhone = typeof record.phone === 'string' ? record.phone.trim() : '';
  if (!rawPhone) {
    fieldErrors.push({
      field: 'phone',
      code: 'REQUIRED',
      message: 'Enter a contact phone number.',
    });
  } else if (!isValidPhoneNumber(rawPhone)) {
    fieldErrors.push({
      field: 'phone',
      code: 'INVALID_FORMAT',
      message: 'Enter a valid contact phone number (7 to 15 digits).',
    });
  }

  let email: string | null = null;
  if (record.email !== undefined && record.email !== null && String(record.email).trim() !== '') {
    const rawEmail = String(record.email).trim().toLowerCase();
    if (rawEmail.length > 160 || !EMAIL_REGEX.test(rawEmail)) {
      fieldErrors.push({
        field: 'email',
        code: 'INVALID_FORMAT',
        message: 'Enter a valid email address or leave this optional field blank.',
      });
    } else {
      email = rawEmail;
    }
  }

  const entryLevel = typeof record.entryLevel === 'string' ? record.entryLevel.trim() : '';
  if (!entryLevel) {
    fieldErrors.push({
      field: 'entryLevel',
      code: 'REQUIRED',
      message: 'Select a class or entry level of interest.',
    });
  } else if (!APPROVED_ENTRY_LEVELS.includes(entryLevel as ApprovedEntryLevel)) {
    fieldErrors.push({
      field: 'entryLevel',
      code: 'UNAPPROVED_OPTION',
      message: `Select one of the approved entry levels: ${APPROVED_ENTRY_LEVELS.join(', ')}.`,
    });
  }

  let message: string | null = null;
  if (record.message !== undefined && record.message !== null && String(record.message).trim() !== '') {
    const rawMessage = String(record.message).trim();
    if (rawMessage.length > 1500) {
      fieldErrors.push({
        field: 'message',
        code: 'INVALID_LENGTH',
        message: 'Message or question must not exceed 1,500 characters.',
      });
    } else {
      message = rawMessage;
    }
  }

  if (record.privacyAcknowledged !== true) {
    fieldErrors.push({
      field: 'privacyAcknowledged',
      code: 'REQUIRED',
      message: 'Please acknowledge the Privacy Notice before submitting your enquiry.',
    });
  }

  let idempotencyKey: string | null = null;
  if (typeof record.idempotencyKey === 'string' && record.idempotencyKey.trim()) {
    idempotencyKey = record.idempotencyKey.trim().slice(0, 100);
  }

  if (fieldErrors.length > 0) {
    throw new ValidationError('One or more enquiry fields need attention.', fieldErrors);
  }

  return {
    parentName,
    phone: normalizePhoneNumber(rawPhone),
    email,
    entryLevel: entryLevel as ApprovedEntryLevel,
    message,
    privacyAcknowledged: true,
    idempotencyKey,
  };
}

export interface ValidatedNewsArticleInput {
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  featuredImageId: string | null;
  status: PublicationStatus;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

const VALID_PUBLICATION_STATUSES: readonly PublicationStatus[] = [
  'draft',
  'published',
  'unpublished',
  'archived',
];

export function validateNewsArticleInput(payload: unknown): ValidatedNewsArticleInput {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ValidationError('Article input must be a valid JSON object.');
  }
  const record = payload as Record<string, unknown>;
  const fieldErrors: FieldError[] = [];

  const title = typeof record.title === 'string' ? record.title.trim() : '';
  if (!title || title.length < 3 || title.length > 180) {
    fieldErrors.push({
      field: 'title',
      code: 'INVALID_TITLE',
      message: 'Article title is required (3 to 180 characters).',
    });
  }

  const rawSlug =
    typeof record.slug === 'string' && record.slug.trim()
      ? normalizeSlug(record.slug)
      : normalizeSlug(title);
  if (!rawSlug || !SLUG_REGEX.test(rawSlug)) {
    fieldErrors.push({
      field: 'slug',
      code: 'INVALID_SLUG',
      message: 'Provide a valid URL-safe slug using lowercase letters, numbers, and hyphens.',
    });
  }

  const rawBody = typeof record.body === 'string' ? sanitizeRichTextHtml(record.body) : '';
  if (!rawBody || rawBody.length < 10 || rawBody.length > 50000) {
    fieldErrors.push({
      field: 'body',
      code: 'INVALID_BODY',
      message: 'Article body is required (minimum 10 characters).',
    });
  }

  const excerpt =
    typeof record.excerpt === 'string' && record.excerpt.trim()
      ? record.excerpt.trim().slice(0, 400)
      : null;

  const status =
    typeof record.status === 'string' ? (record.status.trim() as PublicationStatus) : 'draft';
  if (!VALID_PUBLICATION_STATUSES.includes(status)) {
    fieldErrors.push({
      field: 'status',
      code: 'INVALID_STATUS',
      message: 'Status must be draft, published, unpublished, or archived.',
    });
  }

  const featuredImageId =
    typeof record.featuredImageId === 'string' && record.featuredImageId.trim()
      ? record.featuredImageId.trim()
      : null;

  const seoTitle =
    typeof record.seoTitle === 'string' && record.seoTitle.trim()
      ? record.seoTitle.trim().slice(0, 120)
      : null;

  const seoDescription =
    typeof record.seoDescription === 'string' && record.seoDescription.trim()
      ? record.seoDescription.trim().slice(0, 260)
      : null;

  let publishedAt: string | null = null;
  if (typeof record.publishedAt === 'string' && record.publishedAt.trim()) {
    const parsedDate = Date.parse(record.publishedAt);
    if (Number.isNaN(parsedDate)) {
      fieldErrors.push({
        field: 'publishedAt',
        code: 'INVALID_DATE',
        message: 'Publication date must be a valid ISO-8601 timestamp.',
      });
    } else {
      publishedAt = new Date(parsedDate).toISOString();
    }
  } else if (status === 'published') {
    publishedAt = new Date().toISOString();
  }

  if (fieldErrors.length > 0) {
    throw new ValidationError('Article validation failed.', fieldErrors);
  }

  return {
    title,
    slug: rawSlug,
    excerpt,
    body: rawBody,
    featuredImageId,
    status,
    publishedAt,
    seoTitle,
    seoDescription,
  };
}

export interface ValidatedGalleryImageMetadata {
  altText: string;
  caption: string | null;
  albumId: string | null;
  displayOrder: number;
  status: PublicationStatus;
  schoolApproved: boolean;
  identifiableStudents: boolean;
  approvalReference: string | null;
  contentStatus: ContentVerificationStatus;
}

const VALID_CONTENT_STATUSES: readonly ContentVerificationStatus[] = [
  'verified',
  'pending_approval',
  'placeholder',
  'optional',
];

export function validateGalleryImageMetadata(payload: Record<string, unknown>): ValidatedGalleryImageMetadata {
  const fieldErrors: FieldError[] = [];

  const altText = typeof payload.altText === 'string' ? payload.altText.trim() : '';
  if (!altText || altText.length < 3 || altText.length > 240) {
    fieldErrors.push({
      field: 'altText',
      code: 'REQUIRED',
      message: 'Meaningful alternative text (3 to 240 characters) is required for accessibility.',
    });
  }

  const caption =
    typeof payload.caption === 'string' && payload.caption.trim()
      ? payload.caption.trim().slice(0, 300)
      : null;

  const albumId =
    typeof payload.albumId === 'string' && payload.albumId.trim()
      ? payload.albumId.trim()
      : null;

  const displayOrder =
     payload.displayOrder !== undefined && payload.displayOrder !== null
      ? Number(payload.displayOrder)
      : 0;
  if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 10000) {
    fieldErrors.push({
      field: 'displayOrder',
      code: 'INVALID_ORDER',
      message: 'Display order must be a non-negative integer.',
    });
  }

  const status =
    typeof payload.status === 'string' ? (payload.status.trim() as PublicationStatus) : 'draft';
  if (!VALID_PUBLICATION_STATUSES.includes(status)) {
    fieldErrors.push({
      field: 'status',
      code: 'INVALID_STATUS',
      message: 'Status must be draft, published, unpublished, or archived.',
    });
  }

  const schoolApproved = Boolean(payload.schoolApproved);
  const identifiableStudents = Boolean(payload.identifiableStudents);
  const approvalReference =
    typeof payload.approvalReference === 'string' && payload.approvalReference.trim()
      ? payload.approvalReference.trim().slice(0, 180)
      : null;

  const contentStatus: ContentVerificationStatus =
    typeof payload.contentStatus === 'string' &&
    VALID_CONTENT_STATUSES.includes(payload.contentStatus as ContentVerificationStatus)
      ? (payload.contentStatus as ContentVerificationStatus)
      : 'verified';

  if (fieldErrors.length > 0) {
    throw new ValidationError('Gallery image validation failed.', fieldErrors);
  }

  return {
    altText,
    caption,
    albumId,
    displayOrder,
    status,
    schoolApproved,
    identifiableStudents,
    approvalReference,
    contentStatus,
  };
}

const PROHIBITED_SETTINGS_SECRET_KEYS = new Set([
  'sessionSecret',
  'databaseUrl',
  'databasePassword',
  'privateKey',
  'apiKey',
  'secretKey',
  'storageSecret',
  'passwordHash',
]);

export function validateSiteSettingsUpdate(payload: unknown): {
  officialName?: string;
  motto?: string;
  telephone?: string | null;
  email?: string | null;
  whatsappNumber?: string | null;
  address?: string | null;
  officeHours?: string | null;
  directionsUrl?: string | null;
  socialLinks?: SocialLink[];
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  brandColors?: {
    primary: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    onPrimary: string;
  };
} {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ValidationError('Settings update must be a valid JSON object.');
  }

  const record = payload as Record<string, unknown>;
  const fieldErrors: FieldError[] = [];

  for (const key of Object.keys(record)) {
    if (PROHIBITED_SETTINGS_SECRET_KEYS.has(key) || /secret|password|token|private_key/i.test(key)) {
      fieldErrors.push({
        field: key,
        code: 'SECRET_NOT_ALLOWED',
        message: 'Infrastructure credentials and secrets must never be stored in website settings.',
      });
    }
  }

  const result: ReturnType<typeof validateSiteSettingsUpdate> = {};

  if (record.officialName !== undefined) {
    const name = String(record.officialName).trim();
    if (!name || name.length < 3 || name.length > 140) {
      fieldErrors.push({
        field: 'officialName',
        code: 'INVALID_LENGTH',
        message: 'Official school name must be between 3 and 140 characters.',
      });
    } else {
      result.officialName = name;
    }
  }

  if (record.motto !== undefined) {
    const motto = String(record.motto).trim();
    if (!motto || motto.length > 140) {
      fieldErrors.push({
        field: 'motto',
        code: 'INVALID_LENGTH',
        message: 'Motto must be between 1 and 140 characters.',
      });
    } else {
      result.motto = motto;
    }
  }

  if (record.telephone !== undefined) {
    if (record.telephone === null || String(record.telephone).trim() === '') {
      result.telephone = null;
    } else {
      const tel = String(record.telephone).trim();
      if (!isValidPhoneNumber(tel)) {
        fieldErrors.push({
          field: 'telephone',
          code: 'INVALID_FORMAT',
          message: 'Enter a valid telephone number (7 to 15 digits) or leave blank.',
        });
      } else {
        result.telephone = normalizePhoneNumber(tel);
      }
    }
  }

  if (record.email !== undefined) {
    if (record.email === null || String(record.email).trim() === '') {
      result.email = null;
    } else {
      const email = String(record.email).trim().toLowerCase();
      if (!EMAIL_REGEX.test(email)) {
        fieldErrors.push({
          field: 'email',
          code: 'INVALID_FORMAT',
          message: 'Enter a valid public contact email address.',
        });
      } else {
        result.email = email;
      }
    }
  }

  if (record.whatsappNumber !== undefined) {
    if (record.whatsappNumber === null || String(record.whatsappNumber).trim() === '') {
      result.whatsappNumber = null;
    } else {
      const normalizedWa = normalizeWhatsAppNumber(String(record.whatsappNumber));
      if (!normalizedWa) {
        fieldErrors.push({
          field: 'whatsappNumber',
          code: 'INVALID_WHATSAPP_NUMBER',
          message: 'Enter a valid international WhatsApp number (10 to 15 digits, e.g. 2348030000000).',
        });
      } else {
        result.whatsappNumber = normalizedWa;
      }
    }
  }

  if (record.address !== undefined) {
    result.address =
      record.address === null || String(record.address).trim() === ''
        ? null
        : String(record.address).trim().slice(0, 300);
  }

  if (record.officeHours !== undefined) {
    result.officeHours =
      record.officeHours === null || String(record.officeHours).trim() === ''
        ? null
        : String(record.officeHours).trim().slice(0, 180);
  }

  if (record.directionsUrl !== undefined) {
    if (record.directionsUrl === null || String(record.directionsUrl).trim() === '') {
      result.directionsUrl = null;
    } else {
      const url = String(record.directionsUrl).trim();
      if (!isSafeNavigationUrl(url)) {
        fieldErrors.push({
          field: 'directionsUrl',
          code: 'UNSAFE_URL',
          message: 'Directions URL must use https:// or http://.',
        });
      } else {
        result.directionsUrl = url;
      }
    }
  }

  if (record.socialLinks !== undefined) {
    if (!Array.isArray(record.socialLinks)) {
      fieldErrors.push({
        field: 'socialLinks',
        code: 'INVALID_TYPE',
        message: 'Social links must be an array.',
      });
    } else {
      const links: SocialLink[] = [];
      record.socialLinks.forEach((item, index) => {
        if (!item || typeof item !== 'object') return;
        const obj = item as Record<string, unknown>;
        const platform = String(obj.platform || '').trim();
        const label = String(obj.label || platform).trim();
        const url = String(obj.url || '').trim();
        if (!platform || !isSafeNavigationUrl(url)) {
          fieldErrors.push({
            field: `socialLinks[${index}]`,
            code: 'UNSAFE_URL',
            message: 'Every social link must have a platform name and a valid https:// URL.',
          });
        } else {
          links.push({ platform, label, url });
        }
      });
      result.socialLinks = links;
    }
  }

  if (record.brandColors !== undefined && record.brandColors && typeof record.brandColors === 'object') {
    const bc = record.brandColors as Record<string, unknown>;
    const primary = String(bc.primary || '#5B1A69').trim();
    const primaryDark = String(bc.primaryDark || '#3B0F47').trim();
    const secondary = String(bc.secondary || '#7A288C').trim();
    const accent = String(bc.accent || '#D97706').trim();
    const onPrimary = String(bc.onPrimary || '#FFFFFF').trim();
    if (
      !HEX_COLOR_REGEX.test(primary) ||
      !HEX_COLOR_REGEX.test(primaryDark) ||
      !HEX_COLOR_REGEX.test(secondary) ||
      !HEX_COLOR_REGEX.test(accent) ||
      !HEX_COLOR_REGEX.test(onPrimary)
    ) {
      fieldErrors.push({
        field: 'brandColors',
        code: 'INVALID_COLOR',
        message: 'Brand colors must be 6-digit hex color codes (e.g. #5B1A69).',
      });
    } else {
      result.brandColors = { primary, primaryDark, secondary, accent, onPrimary };
    }
  }

  if (record.defaultSeoTitle !== undefined) {
    result.defaultSeoTitle = String(record.defaultSeoTitle).trim().slice(0, 120);
  }
  if (record.defaultSeoDescription !== undefined) {
    result.defaultSeoDescription = String(record.defaultSeoDescription).trim().slice(0, 260);
  }

  if (fieldErrors.length > 0) {
    throw new ValidationError('Settings validation failed.', fieldErrors);
  }

  return result;
}

export function validateEnquiryStatusInput(payload: unknown): {
  status: EnquiryStatus;
  assignedTo?: string | null;
} {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ValidationError('Status update must be a valid JSON object.');
  }
  const record = payload as Record<string, unknown>;
  const validStatuses: readonly EnquiryStatus[] = ['new', 'contacted', 'resolved', 'archived'];
  const status = typeof record.status === 'string' ? (record.status.trim() as EnquiryStatus) : ('' as EnquiryStatus);

  if (!validStatuses.includes(status)) {
    throw new ValidationError('Invalid enquiry status.', [
      {
        field: 'status',
        code: 'INVALID_STATUS',
        message: 'Status must be new, contacted, resolved, or archived.',
      },
    ]);
  }

  const assignedTo =
    record.assignedTo === undefined
      ? undefined
      : record.assignedTo === null || String(record.assignedTo).trim() === ''
      ? null
      : String(record.assignedTo).trim();

  return { status, assignedTo };
}

export function validateInstitutionalContentUpdate(
  payload: unknown,
  current: InstitutionalContent
): InstitutionalContent {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ValidationError('Institutional content update must be a valid JSON object.');
  }
  const record = payload as Record<string, unknown>;
  const fieldErrors: FieldError[] = [];

  const updated: InstitutionalContent = structuredClone(current);

  if (record.about && typeof record.about === 'object') {
    const a = record.about as Record<string, unknown>;
    if (typeof a.introduction === 'string') {
      const intro = a.introduction.trim();
      if (!intro) {
        fieldErrors.push({
          field: 'about.introduction',
          code: 'REQUIRED',
          message: 'About introduction cannot be empty.',
        });
      } else {
        updated.about.introduction = intro.slice(0, 2500);
      }
    }
    if (a.history !== undefined) {
      updated.about.history = a.history ? String(a.history).trim().slice(0, 4000) : null;
    }
    if (a.mission !== undefined) {
      updated.about.mission = a.mission ? String(a.mission).trim().slice(0, 1000) : null;
    }
    if (a.vision !== undefined) {
      updated.about.vision = a.vision ? String(a.vision).trim().slice(0, 1000) : null;
    }
    if (typeof a.motto === 'string' && a.motto.trim()) {
      updated.about.motto = a.motto.trim().slice(0, 140);
    }
    if (a.philosophy !== undefined) {
      updated.about.philosophy = a.philosophy ? String(a.philosophy).trim().slice(0, 2000) : null;
    }
    if (a.leadershipNote !== undefined) {
      updated.about.leadershipNote = a.leadershipNote
        ? String(a.leadershipNote).trim().slice(0, 2000)
        : null;
    }
    if (Array.isArray(a.coreValues)) {
      updated.about.coreValues = a.coreValues
        .filter((v) => v && typeof v === 'object')
        .map((v) => {
          const item = v as Record<string, unknown>;
          return {
            title: String(item.title || '').trim().slice(0, 80),
            description: String(item.description || '').trim().slice(0, 400),
          };
        })
        .filter((v) => v.title && v.description);
    }
  }

  if (record.academics && typeof record.academics === 'object') {
    const ac = record.academics as Record<string, unknown>;
    if (typeof ac.introduction === 'string' && ac.introduction.trim()) {
      updated.academics.introduction = ac.introduction.trim().slice(0, 2500);
    }
    if (ac.curriculumOverview !== undefined) {
      updated.academics.curriculumOverview = ac.curriculumOverview
        ? String(ac.curriculumOverview).trim().slice(0, 2500)
        : null;
    }
    if (ac.teachingApproach !== undefined) {
      updated.academics.teachingApproach = ac.teachingApproach
        ? String(ac.teachingApproach).trim().slice(0, 2500)
        : null;
    }
    if (Array.isArray(ac.facilities)) {
      updated.academics.facilities = ac.facilities
        .map((f) => String(f).trim())
        .filter(Boolean)
        .slice(0, 25);
    }
    if (Array.isArray(ac.extracurriculars)) {
      updated.academics.extracurriculars = ac.extracurriculars
        .map((e) => String(e).trim())
        .filter(Boolean)
        .slice(0, 25);
    }
    if (ac.earlyYears && typeof ac.earlyYears === 'object') {
      const ey = ac.earlyYears as Record<string, unknown>;
      updated.academics.earlyYears = {
        name: String(ey.name || 'Early Years (Day Care, KG 1–2, Nursery 1–2)').trim(),
        summary: String(ey.summary || '').trim().slice(0, 1200),
        subjects: Array.isArray(ey.subjects)
          ? ey.subjects.map((s) => String(s).trim()).filter(Boolean)
          : [],
      };
    }
    if (ac.primarySchool && typeof ac.primarySchool === 'object') {
      const ps = ac.primarySchool as Record<string, unknown>;
      updated.academics.primarySchool = {
        name: String(ps.name || 'Primary School (Primary 1 – Primary 5)').trim(),
        summary: String(ps.summary || '').trim().slice(0, 1200),
        subjects: Array.isArray(ps.subjects)
          ? ps.subjects.map((s) => String(s).trim()).filter(Boolean)
          : [],
      };
    }
    if (ac.juniorSecondary && typeof ac.juniorSecondary === 'object') {
      const js = ac.juniorSecondary as Record<string, unknown>;
      updated.academics.juniorSecondary = {
        name: String(js.name || 'Junior Secondary School (JSS 1 – JSS 3)').trim(),
        summary: String(js.summary || '').trim().slice(0, 1200),
        subjects: Array.isArray(js.subjects)
          ? js.subjects.map((s) => String(s).trim()).filter(Boolean)
          : [],
      };
    }
    if (ac.seniorSecondary && typeof ac.seniorSecondary === 'object') {
      const ss = ac.seniorSecondary as Record<string, unknown>;
      updated.academics.seniorSecondary = {
        name: String(ss.name || 'Senior Secondary School (SSS 1 – SSS 3)').trim(),
        summary: String(ss.summary || '').trim().slice(0, 1200),
        subjects: Array.isArray(ss.subjects)
          ? ss.subjects.map((s) => String(s).trim()).filter(Boolean)
          : [],
      };
    }
  }

  if (record.admissions && typeof record.admissions === 'object') {
    const ad = record.admissions as Record<string, unknown>;
    if (typeof ad.introduction === 'string' && ad.introduction.trim()) {
      updated.admissions.introduction = ad.introduction.trim().slice(0, 2500);
    }
    if (typeof ad.applicationAvailabilityNote === 'string' && ad.applicationAvailabilityNote.trim()) {
      updated.admissions.applicationAvailabilityNote = ad.applicationAvailabilityNote
        .trim()
        .slice(0, 1000);
    }
    if (Array.isArray(ad.requirements)) {
      updated.admissions.requirements = ad.requirements
        .map((r) => String(r).trim())
        .filter(Boolean)
        .slice(0, 20);
    }
    if (typeof ad.privacyNoticeSummary === 'string' && ad.privacyNoticeSummary.trim()) {
      updated.admissions.privacyNoticeSummary = ad.privacyNoticeSummary.trim().slice(0, 1000);
    }
    if (typeof ad.privacyNoticeFullText === 'string' && ad.privacyNoticeFullText.trim()) {
      updated.admissions.privacyNoticeFullText = ad.privacyNoticeFullText.trim().slice(0, 10000);
    }
  }

  if (fieldErrors.length > 0) {
    throw new ValidationError('Institutional content validation failed.', fieldErrors);
  }

  updated.updatedAt = new Date().toISOString();
  return updated;
}

// ============================================================================
// Admin Staff Account & Password Validation
// ============================================================================

export function validatePasswordStrength(password: unknown, fieldName = 'password'): string {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    throw new ValidationError('Password validation failed.', [
      {
        field: fieldName,
        code: 'INVALID_LENGTH',
        message: 'Password must be between 12 and 128 characters long.',
      },
    ]);
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  if (!hasUpper || !hasLower || !hasDigit || !hasSymbol) {
    throw new ValidationError('Password validation failed.', [
      {
        field: fieldName,
        code: 'WEAK_PASSWORD',
        message:
          'Password must include uppercase, lowercase, a number, and a special character.',
      },
    ]);
  }
  return password;
}

export interface CreateAdminAccountInput {
  displayName: string;
  email: string;
  password: string;
}

export function validateCreateAdminAccountInput(raw: unknown): CreateAdminAccountInput {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new BadRequestError('Request body must be a JSON object.');
  }
  const record = raw as Record<string, unknown>;
  const fieldErrors: FieldError[] = [];

  const displayName = typeof record.displayName === 'string' ? record.displayName.trim() : '';
  if (displayName.length < 2 || displayName.length > 100) {
    fieldErrors.push({
      field: 'displayName',
      code: 'INVALID_LENGTH',
      message: 'Display name must be between 2 and 100 characters.',
    });
  }

  const email = typeof record.email === 'string' ? record.email.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
    fieldErrors.push({
      field: 'email',
      code: 'INVALID_EMAIL',
      message: 'Please provide a valid staff email address.',
    });
  }

  try {
    validatePasswordStrength(record.password, 'password');
  } catch (err) {
    if (err instanceof ValidationError && err.fieldErrors) {
      fieldErrors.push(...err.fieldErrors);
    }
  }

  if (fieldErrors.length > 0) {
    throw new ValidationError('Admin account validation failed.', fieldErrors);
  }

  return {
    displayName,
    email,
    password: record.password as string,
  };
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function validateChangePasswordInput(raw: unknown): ChangePasswordInput {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new BadRequestError('Request body must be a JSON object.');
  }
  const record = raw as Record<string, unknown>;
  const fieldErrors: FieldError[] = [];

  const currentPassword = typeof record.currentPassword === 'string' ? record.currentPassword : '';
  if (!currentPassword) {
    fieldErrors.push({
      field: 'currentPassword',
      code: 'REQUIRED',
      message: 'Current password is required.',
    });
  }

  try {
    validatePasswordStrength(record.newPassword, 'newPassword');
  } catch (err) {
    if (err instanceof ValidationError && err.fieldErrors) {
      fieldErrors.push(...err.fieldErrors);
    }
  }

  if (currentPassword && typeof record.newPassword === 'string' && currentPassword === record.newPassword) {
    fieldErrors.push({
      field: 'newPassword',
      code: 'PASSWORD_UNCHANGED',
      message: 'New password must be different from your current password.',
    });
  }

  if (fieldErrors.length > 0) {
    throw new ValidationError('Password change validation failed.', fieldErrors);
  }

  return {
    currentPassword,
    newPassword: record.newPassword as string,
  };
}

export interface AdminAccountUpdateInput {
  displayName?: string;
  isActive?: boolean;
  newPassword?: string;
}

export function validateAdminAccountUpdateInput(raw: unknown): AdminAccountUpdateInput {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new BadRequestError('Request body must be a JSON object.');
  }
  const record = raw as Record<string, unknown>;
  const fieldErrors: FieldError[] = [];
  const result: AdminAccountUpdateInput = {};

  if (record.displayName !== undefined) {
    const displayName = typeof record.displayName === 'string' ? record.displayName.trim() : '';
    if (displayName.length < 2 || displayName.length > 100) {
      fieldErrors.push({
        field: 'displayName',
        code: 'INVALID_LENGTH',
        message: 'Display name must be between 2 and 100 characters.',
      });
    } else {
      result.displayName = displayName;
    }
  }

  if (record.isActive !== undefined) {
    if (typeof record.isActive !== 'boolean') {
      fieldErrors.push({
        field: 'isActive',
        code: 'INVALID_TYPE',
        message: 'isActive must be a boolean.',
      });
    } else {
      result.isActive = record.isActive;
    }
  }

  if (record.newPassword !== undefined) {
    try {
      result.newPassword = validatePasswordStrength(record.newPassword, 'newPassword');
    } catch (err) {
      if (err instanceof ValidationError && err.fieldErrors) {
        fieldErrors.push(...err.fieldErrors);
      }
    }
  }

  if (
    result.displayName === undefined &&
    result.isActive === undefined &&
    result.newPassword === undefined
  ) {
    fieldErrors.push({
      field: 'body',
      code: 'EMPTY_UPDATE',
      message: 'Provide displayName, isActive, or newPassword to update.',
    });
  }

  if (fieldErrors.length > 0) {
    throw new ValidationError('Admin account update validation failed.', fieldErrors);
  }

  return result;
}


