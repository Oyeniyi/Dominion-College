import { describe, it, beforeEach, afterAll } from 'vitest';
import assert from 'node:assert/strict';
import { closeDatabase, resetDatabaseForTests } from '../../src/server/db/client';
import {
  createAdmissionsEnquiry,
  getPublicSiteSettings,
  listPublishedNews,
} from '../../src/server/services/cms-service';

const hasPostgresTestDb = Boolean(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);

describe.runIf(hasPostgresTestDb)('PostgreSQL End-to-End Service Integration', () => {
  beforeEach(async () => {
    await resetDatabaseForTests();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('reads seeded site settings, published news, and handles deduplicated admissions enquiries', async () => {
    const settings = await getPublicSiteSettings();
    assert.equal(settings.officialName, 'Dominion College, Oba-Ile, Akure');

    const news = await listPublishedNews({ limit: 10 });
    assert.ok(news.items.length >= 1);

    const first = await createAdmissionsEnquiry({
      parentName: 'Dr. Tunde Bakare',
      phone: '+2348031112233',
      email: 'tunde.bakare@example.com',
      entryLevel: 'Day Care',
      message: 'Enquiring for Day Care enrollment.',
      privacyAcknowledged: true,
    });
    assert.equal(first.deduplicated, false);

    const second = await createAdmissionsEnquiry({
      parentName: 'Dr. Tunde Bakare',
      phone: '+2348031112233',
      email: 'tunde.bakare@example.com',
      entryLevel: 'Day Care',
      message: 'Enquiring for Day Care enrollment.',
      privacyAcknowledged: true,
    });
    assert.equal(second.deduplicated, true);
    assert.equal(second.createdId, first.createdId);
  });
});
