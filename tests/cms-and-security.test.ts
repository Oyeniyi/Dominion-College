import { describe, it, beforeEach, afterAll } from 'vitest';
import assert from 'node:assert/strict';

// Configure isolated test environment variables before importing server modules
process.env.SESSION_SECRET = 'test-session-secret-with-at-least-32-characters-long-9999';
process.env.ADMIN_BOOTSTRAP_EMAIL = 'admin@dominioncollege.edu.ng';
process.env.ADMIN_BOOTSTRAP_PASSWORD = 'DominionTestPassword!2026';
process.env.ADMIN_BOOTSTRAP_NAME = 'Test School Administrator';

const hasPostgresTestDb = Boolean(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);

import {
  validateEnquiryCreateInput,
  sanitizeRichTextHtml,
  buildWhatsAppClickToChatUrl,
  isSafeNavigationUrl,
  validateSiteSettingsUpdate,
  validatePasswordStrength,
} from '../src/domain/validation.ts';
import {
  assertAuthorized,
  assertValidEnquiryStatusTransition,
  assertValidPublicationTransition,
  assertGalleryImagePublishable,
} from '../src/domain/permissions.ts';
import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  NotFoundError,
  UnsupportedMediaTypeError,
  ValidationError,
  toSafeErrorEnvelope,
} from '../src/domain/errors.ts';
import {
  hashPassword,
  verifyPassword,
  createSignedSessionToken,
  verifySignedSessionToken,
  revokeSessionToken,
} from '../src/server/auth/crypto.ts';
import { inspectImageBufferFormat } from '../src/server/services/media-storage.ts';
import { redactLogMetadata } from '../src/server/logger.ts';
import { closeDatabase, resetDatabaseForTests } from '../src/server/db/client.ts';
import {
  createAdmissionsEnquiry,
  listAdminEnquiries,
  updateAdminEnquiryStatus,
  createAdminNews,
  updateAdminNews,
  deleteAdminNews,
  listPublishedNews,
  getPublishedNewsBySlug,
  uploadAdminGalleryImage,
  updateAdminGalleryImage,
  listPublishedGalleryImages,
  getPublicSiteSettings,
  updateAdminSiteSettings,
  getPublicInstitutionalContent,
  updateAdminInstitutionalContent,
  getAdminDashboardOverview,
  listAdminUsers,
  createAdminUser,
  changeOwnAdminPassword,
  updateAdminUserAccount,
  authenticateAdminCredentials,
} from '../src/server/services/cms-service.ts';
import { APPROVED_ENTRY_LEVELS, type AdminUser } from '../src/domain/types.ts';

const adminActor: AdminUser = {
  id: '00000000-0000-4000-8000-000000000001',
  identitySubject: 'local:admin@dominioncollege.edu.ng',
  displayName: 'Test School Administrator',
  email: 'admin@dominioncollege.edu.ng',
  roleCode: 'administrator',
  isActive: true,
  createdAt: '2026-11-10T08:00:00.000Z',
  updatedAt: '2026-11-10T08:00:00.000Z',
  lastLoginAt: null,
};

describe('Dominion College — Validation, Security & RBAC Unit Tests', () => {
  it('supports all approved entry levels from Day Care, KG 1-2, Nursery 1-2, Primary 1-5 through JSS 1-3 and SSS 1-3', () => {
    const expectedLevels = [
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
    ];
    assert.deepEqual([...APPROVED_ENTRY_LEVELS], expectedLevels);

    for (const level of expectedLevels) {
      const validated = validateEnquiryCreateInput({
        parentName: 'Mrs. Adebisi Ogunleye',
        phone: '+234 803 123 4567',
        email: 'adebisi@example.com',
        entryLevel: level,
        message: `Enquiring about ${level} admission.`,
        privacyAcknowledged: true,
      });
      assert.equal(validated.entryLevel, level);
    }
  });

  it('rejects missing privacy acknowledgement and prohibited sensitive student fields', () => {
    assert.throws(
      () =>
        validateEnquiryCreateInput({
          parentName: 'Mrs. Adebisi Ogunleye',
          phone: '+234 803 123 4567',
          email: 'adebisi@example.com',
          entryLevel: 'Primary 3',
          message: 'Enquiring about admission.',
          privacyAcknowledged: false,
        }),
      (err: unknown) =>
        err instanceof ValidationError &&
        Boolean(err.fieldErrors?.some((f) => f.field === 'privacyAcknowledged')),
    );

    assert.throws(
      () =>
        validateEnquiryCreateInput({
          parentName: 'Mrs. Adebisi Ogunleye',
          phone: '+234 803 123 4567',
          entryLevel: 'Nursery 1',
          medicalHistory: 'Asthma',
          privacyAcknowledged: true,
        }),
      (err: unknown) =>
        err instanceof ValidationError &&
        Boolean(err.fieldErrors?.some((f) => f.field === 'medicalHistory')),
    );
  });

  it('sanitizes HTML content by stripping scripts, iframes, inline event handlers, and javascript: URLs', () => {
    const dirty = `
      <h2>Welcome to Dominion College</h2>
      <script>alert('xss')</script>
      <p onclick="stealCookies()">Guided by our motto: <strong>THE SECERET OF WISDOM IS GOD</strong>.</p>
      <a href="javascript:evil()">Bad Link</a>
      <a href="https://dominioncollege.edu.ng">Good Link</a>
    `;
    const clean = sanitizeRichTextHtml(dirty);

    assert.ok(!clean.includes('<script'));
    assert.ok(!clean.includes('onclick'));
    assert.ok(!clean.includes('javascript:'));
    assert.ok(clean.includes('<h2>Welcome to Dominion College</h2>'));
  });

  it('enforces fail-closed RBAC authorization and rejects unauthenticated or unknown roles', () => {
    assert.throws(() => assertAuthorized(null, 'content:create'), AuthorizationError);
    assert.throws(
      () =>
        assertAuthorized(
          { ...adminActor, roleCode: 'guest' as unknown as 'administrator' },
          'content:create',
        ),
      AuthorizationError,
    );
    assert.doesNotThrow(() => assertAuthorized(adminActor, 'content:create'));
  });

  it('enforces enquiry status transition state machine', () => {
    assert.doesNotThrow(() => assertValidEnquiryStatusTransition('new', 'contacted'));
    assert.doesNotThrow(() => assertValidEnquiryStatusTransition('contacted', 'resolved'));
    assert.throws(() => assertValidEnquiryStatusTransition('resolved', 'new'), ConflictError);
    assert.throws(() => assertValidEnquiryStatusTransition('archived', 'new'), ConflictError);
  });

  it('enforces child-protection gallery publication checks (schoolApproved + identifiableStudents consent)', () => {
    assert.throws(
      () =>
        assertGalleryImagePublishable({
          status: 'published',
          schoolApproved: false,
          identifiableStudents: false,
          approvalReference: null,
        }),
      ValidationError,
    );

    assert.throws(
      () =>
        assertGalleryImagePublishable({
          status: 'published',
          schoolApproved: true,
          identifiableStudents: true,
          approvalReference: '',
        }),
      ValidationError,
    );

    assert.doesNotThrow(() =>
      assertGalleryImagePublishable({
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'CONSENT-2026-009',
      }),
    );

    assert.doesNotThrow(() => assertValidPublicationTransition('published', 'published'));
    assert.doesNotThrow(() => assertValidPublicationTransition('published', 'draft'));
    assert.doesNotThrow(() => assertValidPublicationTransition('published', 'unpublished'));
  });

  it('rejects secret keys in public site settings updates and validates WhatsApp URLs', () => {
    assert.throws(
      () =>
        validateSiteSettingsUpdate({
          officialName: 'Dominion College',
          sessionSecret: 'leaked-secret',
        }),
      ValidationError,
    );

    const waUrl = buildWhatsAppClickToChatUrl('+234 803 123 4567', 'Hello');
    assert.equal(waUrl, 'https://wa.me/2348031234567?text=Hello');
    assert.equal(buildWhatsAppClickToChatUrl(null), null);
    assert.equal(isSafeNavigationUrl('https://dominioncollege.edu.ng/admissions'), true);
    assert.equal(isSafeNavigationUrl('javascript:alert(1)'), false);
  });

  it('hashes and verifies passwords and signs/revokes HMAC session tokens', () => {
    const hash = hashPassword('StrongSchoolPassword#2026');
    assert.equal(verifyPassword('StrongSchoolPassword#2026', hash), true);
    assert.equal(verifyPassword('WrongPassword', hash), false);

    const { token } = createSignedSessionToken(adminActor.id);
    const verified = verifySignedSessionToken(token);
    assert.ok(verified);
    assert.equal(verified.sub, adminActor.id);

    revokeSessionToken(token);
    assert.equal(verifySignedSessionToken(token), null);
  });

  it('inspects binary image magic bytes and rejects disguised scripts or unsafe SVGs', () => {
    const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    assert.equal(inspectImageBufferFormat(validPng), 'png');

    const maliciousSvg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    );
    assert.throws(() => inspectImageBufferFormat(maliciousSvg), UnsupportedMediaTypeError);

    const fakeExe = Buffer.from('MZ-not-an-image-payload');
    assert.throws(() => inspectImageBufferFormat(fakeExe), UnsupportedMediaTypeError);
  });

  it('redacts sensitive fields in logs and formats RFC-7807 safe error envelopes without stack leakage', () => {
    const redacted = redactLogMetadata({
      event: 'test',
      password: 'secret-password',
      email: 'parent@example.com',
      phone: '+2348030000000',
    });
    assert.equal(redacted?.password, '[REDACTED]');
    assert.equal(redacted?.email, '[REDACTED]');
    assert.equal(redacted?.phone, '[REDACTED]');

    const unexpected = new Error('SQLITE_ERROR: table secrets_table failed at /internal/path');
    const envelope = toSafeErrorEnvelope(unexpected, 'req-123');
    assert.equal(envelope.status, 500);
    assert.equal(envelope.code, 'INTERNAL_ERROR');
    assert.ok(!envelope.detail.includes('SQLITE_ERROR'));
  });
});

describe.runIf(hasPostgresTestDb)('Dominion College — Database & CMS Service Integration Tests', () => {
  beforeEach(async () => {
    await resetDatabaseForTests();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('seeds verified Dominion College identity, motto, Early Years, Primary, JSS & SSS content', async () => {
    const settings = await getPublicSiteSettings();
    assert.equal(settings.officialName, 'Dominion College, Oba-Ile, Akure');
    assert.equal(settings.motto, 'THE SECERET OF WISDOM IS GOD');

    const content = await getPublicInstitutionalContent();
    assert.ok(content.academics.earlyYears);
    assert.ok(content.academics.earlyYears.name.includes('Day Care'));
    assert.ok(content.academics.primarySchool);
    assert.ok(content.academics.primarySchool.name.includes('Primary 1'));
    assert.ok(content.academics.juniorSecondary);
    assert.ok(content.academics.seniorSecondary);
  });

  it('persists public admissions enquiries across Day Care / Primary / Secondary and allows admin status updates', async () => {
    const created = await createAdmissionsEnquiry({
      parentName: 'Mr. Kunle Adeyemi',
      phone: '+234 803 555 0199',
      email: 'kunle.adeyemi@example.com',
      entryLevel: 'Primary 4',
      message: 'Seeking Primary 4 admission for September.',
      privacyAcknowledged: true,
    });

    assert.ok(created.createdId);
    assert.equal(created.deduplicated, false);

    const list = await listAdminEnquiries(adminActor, { status: 'new' });
    assert.equal(list.items.length, 1);
    assert.equal(list.items[0].parentName, 'Mr. Kunle Adeyemi');
    assert.equal(list.items[0].entryLevel, 'Primary 4');

    const updated = await updateAdminEnquiryStatus(adminActor, created.createdId, {
      status: 'contacted',
    });
    assert.equal(updated.status, 'contacted');

    const summary = await getAdminDashboardOverview(adminActor);
    assert.equal(summary.totalEnquiriesCount, 1);
    assert.equal(summary.newEnquiriesCount, 0);
  });

  it('isolates draft news articles from public news endpoints until published', async () => {
    const draft = await createAdminNews(adminActor, {
      title: 'Private Draft Notice on Staff Meeting',
      excerpt: 'Internal draft notice not yet ready for public display.',
      body: '<p>Draft body text.</p>',
      status: 'draft',
    });

    const publicBefore = await listPublishedNews({ limit: 20 });
    assert.ok(!publicBefore.items.some((p) => p.slug === draft.slug));
    await assert.rejects(() => getPublishedNewsBySlug(draft.slug), NotFoundError);

    const published = await updateAdminNews(adminActor, draft.id, {
      status: 'published',
    });
    assert.equal(published.status, 'published');

    const publicAfter = await listPublishedNews({ limit: 20 });
    assert.ok(publicAfter.items.some((p) => p.slug === draft.slug));

    await deleteAdminNews(adminActor, draft.id);
    const publicFinal = await listPublishedNews({ limit: 20 });
    assert.ok(!publicFinal.items.some((p) => p.slug === draft.slug));
  });

  it('isolates draft gallery images and enforces student media consent before publishing', async () => {
    const draftImg = await uploadAdminGalleryImage(adminActor, {
      metadata: {
        altText: 'Senior secondary students performing titration',
        caption: 'Students in Chemistry Practical',
        contentStatus: 'verified',
        status: 'draft',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: null,
      },
      placeholderUrl: '/placeholders/science-lab.svg',
    });

    const publicGalleryBefore = await listPublishedGalleryImages({ limit: 50 });
    assert.ok(!publicGalleryBefore.items.some((i) => i.id === draftImg.id));

    // Attempt to publish without approvalReference when identifiableStudents=true must fail
    await assert.rejects(
      () =>
        updateAdminGalleryImage(adminActor, draftImg.id, {
          status: 'published',
        }),
      ValidationError,
    );

    // Providing approvalReference allows publishing
    const publishedImg = await updateAdminGalleryImage(adminActor, draftImg.id, {
      status: 'published',
      approvalReference: 'CONSENT-2026-CHEM-01',
    });
    assert.equal(publishedImg.status, 'published');

    const publicGalleryAfter = await listPublishedGalleryImages({ limit: 50 });
    assert.ok(publicGalleryAfter.items.some((i) => i.id === draftImg.id));
  });

  it('updates public site settings and institutional content via admin service', async () => {
    await updateAdminSiteSettings(adminActor, {
      telephone: '+234 803 999 8888',
      whatsappNumber: '+234 803 999 8888',
      email: 'admissions@dominioncollege.edu.ng',
    });

    const publicSettings = await getPublicSiteSettings();
    assert.equal(publicSettings.telephone, '+2348039998888');
    assert.equal(publicSettings.whatsappNumber, '2348039998888');

    await updateAdminInstitutionalContent(adminActor, {
      about: {
        introduction: 'Updated Dominion College Introduction for the 2026/2027 Session.',
      },
    });

    const publicContent = await getPublicInstitutionalContent();
    assert.equal(
      publicContent.about.introduction,
      'Updated Dominion College Introduction for the 2026/2027 Session.',
    );
  });

  it('creates new administrator accounts, enforces strong passwords, changes own password, and prevents self-lockout', async () => {
    assert.throws(() => validatePasswordStrength('weakpass'), ValidationError);
    assert.equal(validatePasswordStrength('DominionStaff!2026'), 'DominionStaff!2026');

    const created = await createAdminUser(adminActor, {
      displayName: 'Mrs. Adebayo (Bursar)',
      email: 'bursar@dominioncollege.edu.ng',
      password: 'BursarStrongPassword!2026',
    });
    assert.equal(created.email, 'bursar@dominioncollege.edu.ng');
    assert.equal(created.isActive, true);

    await assert.rejects(
      () =>
        createAdminUser(adminActor, {
          displayName: 'Duplicate Bursar',
          email: 'bursar@dominioncollege.edu.ng',
          password: 'BursarStrongPassword!2026',
        }),
      ConflictError,
    );

    const signedInBursar = await authenticateAdminCredentials(
      'bursar@dominioncollege.edu.ng',
      'BursarStrongPassword!2026',
    );
    assert.equal(signedInBursar.id, created.id);

    // Wrong current password rejected
    await assert.rejects(
      () =>
        changeOwnAdminPassword(signedInBursar, {
          currentPassword: 'WrongCurrentPassword!2026',
          newPassword: 'BursarNewPassword!2027',
        }),
      AuthenticationError,
    );

    // Correct current password updates password hash
    await changeOwnAdminPassword(signedInBursar, {
      currentPassword: 'BursarStrongPassword!2026',
      newPassword: 'BursarNewPassword!2027',
    });
    await assert.rejects(
      () =>
        authenticateAdminCredentials(
          'bursar@dominioncollege.edu.ng',
          'BursarStrongPassword!2026',
        ),
      AuthenticationError,
    );
    const reSignedIn = await authenticateAdminCredentials(
      'bursar@dominioncollege.edu.ng',
      'BursarNewPassword!2027',
    );
    assert.equal(reSignedIn.id, created.id);

    // Prevent self-deactivation
    await assert.rejects(
      () => updateAdminUserAccount(reSignedIn, created.id, { isActive: false }),
      ConflictError,
    );

    // Another admin can deactivate the user, blocking future logins
    const disabled = await updateAdminUserAccount(adminActor, created.id, { isActive: false });
    assert.equal(disabled.isActive, false);
    await assert.rejects(
      () =>
        authenticateAdminCredentials(
          'bursar@dominioncollege.edu.ng',
          'BursarNewPassword!2027',
        ),
      AuthorizationError,
    );

    const allAdmins = await listAdminUsers(adminActor);
    assert.ok(allAdmins.length >= 2);
  });
});
