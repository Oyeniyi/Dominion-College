import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { closeDatabase, getSqlClient } from '../src/server/db/client';
import {
  getSupabaseStorageAdminClient,
  getSupabaseStorageBuckets,
} from '../src/server/storage/supabase-client';
import {
  inspectImageBufferFormat,
  storageKeyToObjectPath,
} from '../src/server/services/media-storage';

interface MigrationReport {
  dryRun: boolean;
  overwrite: boolean;
  scannedRecords: number;
  migrated: number;
  skippedPlaceholder: number;
  skippedExisting: number;
  duplicatesDetected: number;
  duplicates: Array<{ id: string; storageKey: string; duplicateOf: string }>;
  missingSourceFiles: string[];
  errors: Array<{ id: string; storageKey: string; error: string }>;
}

const MIME_BY_FORMAT: Record<string, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const overwrite = args.has('--overwrite');

  const stagingDir = path.resolve(
    process.cwd(),
    process.env.MEDIA_STAGING_DIR || './data/staging-uploads'
  );
  const publicDir = path.resolve(
    process.cwd(),
    process.env.MEDIA_PUBLIC_DIR || './public/uploads'
  );

  const report: MigrationReport = {
    dryRun,
    overwrite,
    scannedRecords: 0,
    migrated: 0,
    skippedPlaceholder: 0,
    skippedExisting: 0,
    duplicatesDetected: 0,
    duplicates: [],
    missingSourceFiles: [],
    errors: [],
  };

  const sql = getSqlClient();
  const supabase = getSupabaseStorageAdminClient();
  const { stagingBucket, publicBucket } = getSupabaseStorageBuckets();
  const seenHashes = new Map<string, string>();

  try {
    const rows = await sql<
      {
        id: string;
        storage_key: string;
        public_url: string;
        status: string;
        school_approved: boolean;
      }[]
    >`
      SELECT id, storage_key, public_url, status, school_approved
      FROM gallery_image
      ORDER BY created_at ASC
    `;

    report.scannedRecords = rows.length;

    for (const row of rows) {
      if (!row.storage_key.startsWith('media:')) {
        report.skippedPlaceholder += 1;
        continue;
      }

      const objectPath = storageKeyToObjectPath(row.storage_key);
      if (!objectPath) {
        report.errors.push({
          id: row.id,
          storageKey: row.storage_key,
          error: 'Invalid storage_key format',
        });
        continue;
      }

      const filename = row.storage_key.replace(/^media:/, '');
      const stagingCandidate = path.join(stagingDir, filename);
      const publicCandidate = path.join(publicDir, filename);
      const sourceFile = fs.existsSync(stagingCandidate)
        ? stagingCandidate
        : fs.existsSync(publicCandidate)
          ? publicCandidate
          : null;

      if (!sourceFile) {
        report.missingSourceFiles.push(row.storage_key);
        continue;
      }

      try {
        const buffer = fs.readFileSync(sourceFile);
        const format = inspectImageBufferFormat(buffer);
        const contentType = MIME_BY_FORMAT[format] || 'application/octet-stream';
        const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

        const existingKeyForHash = seenHashes.get(sha256);
        if (existingKeyForHash) {
          report.duplicatesDetected += 1;
          report.duplicates.push({
            id: row.id,
            storageKey: row.storage_key,
            duplicateOf: existingKeyForHash,
          });
        } else {
          seenHashes.set(sha256, row.storage_key);
        }

        if (!overwrite) {
          const { data: existingList, error: listErr } = await supabase.storage
            .from(stagingBucket)
            .list('gallery', { search: filename, limit: 1 });
          if (listErr) {
            throw new Error(`Failed to check existing staging object: ${listErr.message}`);
          }
          if (existingList && existingList.some((item) => item.name === filename)) {
            report.skippedExisting += 1;
            continue;
          }
        }

        const isPubliclyVisible = row.status === 'published' && row.school_approved;

        if (!dryRun) {
          const { error: stageErr } = await supabase.storage
            .from(stagingBucket)
            .upload(objectPath, buffer, {
              contentType,
              cacheControl: '3600',
              upsert: overwrite,
            });
          if (stageErr) {
            throw new Error(`Staging upload failed: ${stageErr.message}`);
          }

          if (isPubliclyVisible) {
            const { error: pubErr } = await supabase.storage
              .from(publicBucket)
              .upload(objectPath, buffer, {
                contentType,
                cacheControl: '31536000',
                upsert: true,
              });
            if (pubErr) {
              if (!overwrite) {
                await supabase.storage.from(stagingBucket).remove([objectPath]).catch(() => {});
              }
              throw new Error(`Public upload failed: ${pubErr.message}`);
            }

            const { data: pubUrlData } = supabase.storage
              .from(publicBucket)
              .getPublicUrl(objectPath);

            try {
              await sql`
                UPDATE gallery_image
                SET public_url = ${pubUrlData.publicUrl}
                WHERE id = ${row.id}
              `;
            } catch (dbErr) {
              if (!overwrite) {
                await supabase.storage.from(publicBucket).remove([objectPath]).catch(() => {});
                await supabase.storage.from(stagingBucket).remove([objectPath]).catch(() => {});
              }
              throw dbErr;
            }
          }
        }

        report.migrated += 1;
      } catch (err) {
        report.errors.push({
          id: row.id,
          storageKey: row.storage_key,
          error: err instanceof Error ? err.message : 'Unknown migration error',
        });
      }
    }

    console.log('Media migration report:', JSON.stringify(report, null, 2));
  } finally {
    await closeDatabase();
  }
}

main().catch((error) => {
  console.error('Media migration failed:', error);
  process.exit(1);
});
