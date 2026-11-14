import { describe, it, beforeEach, afterAll } from 'vitest';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { closeDatabase, getSqlClient, resetDatabaseForTests } from '../../src/server/db/client';
import { findAdminByEmail, insertAdminUser } from '../../src/server/db/repositories/admin.repository';
import {
  insertAdmissionsEnquiry,
  queryEnquiries,
} from '../../src/server/db/repositories/admissions.repository';
import {
  fetchSiteSettingsRow,
  mapPublicSiteSettings,
} from '../../src/server/db/repositories/settings.repository';

const hasPostgresTestDb = Boolean(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);

describe.runIf(hasPostgresTestDb)('PostgreSQL Repositories CRUD', () => {
  beforeEach(async () => {
    await resetDatabaseForTests();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('inserts and queries admin_user case-insensitively by email', async () => {
    const id = crypto.randomUUID();
    await insertAdminUser({
      id,
      identitySubject: 'local:repo-test@dominioncollege.edu.ng',
      displayName: 'Repo Test Admin',
      email: 'Repo-Test@dominioncollege.edu.ng',
      passwordHash: 'scrypt$salt$hash',
      nowIso: new Date().toISOString(),
    });

    const found = await findAdminByEmail('repo-test@dominioncollege.edu.ng');
    assert.ok(found);
    assert.equal(found.id, id);
  });

  it('inserts and queries admissions_enquiry and reads site_settings singleton', async () => {
    const sql = getSqlClient();
    const id = crypto.randomUUID();
    await insertAdmissionsEnquiry(sql, {
      id,
      parentName: 'Mrs. Folake Ogunleye',
      phone: '+2348030001122',
      email: 'folake@example.com',
      entryLevel: 'Nursery 2',
      message: 'Enquiry for Nursery 2.',
      idempotencyKey: null,
      nowIso: new Date().toISOString(),
    });

    const list = await queryEnquiries({ status: 'new', limit: 10, offset: 0 });
    assert.ok(list.some((item) => item.id === id && item.entryLevel === 'Nursery 2'));

    const settingsRow = await fetchSiteSettingsRow();
    const settings = mapPublicSiteSettings(settingsRow);
    assert.equal(settings.officialName, 'Dominion College, Oba-Ile, Akure');
  });
});
