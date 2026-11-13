/**
 * Domain Layer — Core Entities, Value Types, and Projections
 * Adheres to AE-01 (no framework/DB imports), AE-03 (explicit public/private projections),
 * and PRD §8.1–8.2.
 */

export type ContentVerificationStatus = 'verified' | 'pending_approval' | 'placeholder' | 'optional';

export type PublicationStatus = 'draft' | 'published' | 'unpublished' | 'archived';

export type EnquiryStatus = 'new' | 'contacted' | 'resolved' | 'archived';

export const APPROVED_ENTRY_LEVELS = [
  'Day Care',
  'KG 1',
  'KG 2',
  'Nursery 1',
  'Nursery 2',
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'JSS 1',
  'JSS 2',
  'JSS 3',
  'SSS 1',
  'SSS 2',
  'SSS 3',
] as const;

export type ApprovedEntryLevel = (typeof APPROVED_ENTRY_LEVELS)[number];

export type AdminRoleCode = 'administrator';

export type Permission =
  | 'dashboard:read'
  | 'enquiries:read'
  | 'enquiries:update'
  | 'content:read'
  | 'content:create'
  | 'content:update'
  | 'content:publish'
  | 'content:delete'
  | 'gallery:read'
  | 'gallery:upload'
  | 'gallery:update'
  | 'gallery:publish'
  | 'gallery:delete'
  | 'settings:read'
  | 'settings:update'
  | 'users:read'
  | 'users:create'
  | 'users:update';

export interface AdminUser {
  id: string;
  identitySubject: string;
  displayName: string;
  email: string;
  roleCode: AdminRoleCode;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export type AdminActor = Pick<AdminUser, 'id' | 'roleCode' | 'isActive'>;

export interface AdminSessionUser {
  id: string;
  displayName: string;
  email: string;
  roleCode: AdminRoleCode;
  isActive: true;
  permissions: Permission[];
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  albumId: string | null;
  storageKey: string;
  publicUrl: string;
  altText: string;
  caption: string | null;
  displayOrder: number;
  status: PublicationStatus;
  schoolApproved: boolean;
  identifiableStudents: boolean;
  approvalReference: string | null;
  contentStatus: ContentVerificationStatus;
  uploadedBy: string;
  createdAt: string;
}

export interface PublicGalleryImageProjection {
  id: string;
  albumId: string | null;
  albumTitle?: string | null;
  imageUrl: string;
  altText: string;
  caption: string | null;
  displayOrder: number;
  contentStatus: ContentVerificationStatus;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  featuredImageId: string | null;
  status: PublicationStatus;
  publishedAt: string | null;
  authorId: string;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicNewsArticleProjection {
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  featuredImage: {
    imageUrl: string;
    altText: string;
    caption: string | null;
    contentStatus: ContentVerificationStatus;
  } | null;
  publishedAt: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface AdmissionsEnquiry {
  id: string;
  parentName: string;
  phone: string;
  email: string | null;
  entryLevel: ApprovedEntryLevel;
  message: string | null;
  privacyAcknowledged: boolean;
  status: EnquiryStatus;
  assignedTo: string | null;
  idempotencyKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
}

export interface BrandColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  onPrimary: string;
}

export interface AboutPageContent {
  introduction: string;
  history: string | null;
  mission: string | null;
  vision: string | null;
  motto: string;
  philosophy: string | null;
  coreValues: Array<{ title: string; description: string }>;
  leadershipNote: string | null;
  contentStatus: ContentVerificationStatus;
}

export interface AcademicSectionItem {
  name: string;
  summary: string;
  subjects: string[];
}

export interface AcademicsPageContent {
  introduction: string;
  earlyYears?: AcademicSectionItem | null;
  primarySchool?: AcademicSectionItem | null;
  juniorSecondary: AcademicSectionItem | null;
  seniorSecondary: AcademicSectionItem | null;
  curriculumOverview: string | null;
  teachingApproach: string | null;
  facilities: string[];
  extracurriculars: string[];
  contentStatus: ContentVerificationStatus;
}

export interface AdmissionsPageContent {
  introduction: string;
  processSteps: Array<{ stepNumber: number; title: string; description: string }>;
  requirements: string[];
  applicationAvailabilityNote: string;
  privacyNoticeSummary: string;
  privacyNoticeFullText: string;
  contentStatus: ContentVerificationStatus;
}

export interface InstitutionalContent {
  about: AboutPageContent;
  academics: AcademicsPageContent;
  admissions: AdmissionsPageContent;
  updatedAt: string;
}

export interface SiteSettings {
  singletonId: 1;
  officialName: string;
  motto: string;
  logoUrl: string;
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
  updatedAt: string;
}

export interface PublicSiteSettingsProjection {
  officialName: string;
  motto: string;
  logoUrl: string;
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
}

export interface DashboardOverview {
  publishedNewsCount: number;
  draftNewsCount: number;
  publishedGalleryCount: number;
  totalGalleryCount: number;
  albumCount: number;
  newEnquiriesCount: number;
  totalEnquiriesCount: number;
  recentEnquiries: Array<{
    id: string;
    parentName: string;
    entryLevel: ApprovedEntryLevel;
    status: EnquiryStatus;
    createdAt: string;
  }>;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}
