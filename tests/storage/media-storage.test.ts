import { describe, it, beforeEach, afterEach } from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
  ValidationError,
} from '../../src/domain/errors';
import { setSupabaseStorageClientForTests } from '../../src/server/storage/supabase-client';
import {
  MAX_IMAGE_UPLOAD_BYTES,
  inspectImageBufferFormat,
  removeStoredMediaBytes,
  storageKeyToObjectPath,
  storeUploadedImageBytes,
  syncMediaPublicVisibility,
} from '../../src/server/services/media-storage';
import { assertGalleryImagePublishable } from '../../src/domain/permissions';

interface InMemoryObject {
  buffer: Buffer;
  contentType: string;
}

function createMockSupabaseStorageClient(options?: {
  failStagingUpload?: boolean;
  failPublicUpload?: boolean;
}) {
  const buckets = new Map<string, Map<string, InMemoryObject>>([
    ['dominion-media-staging', new Map()],
    ['dominion-media-public', new Map()],
  ]);

  const client = {
    storage: {
      from(bucketName: string) {
        if (!buckets.has(bucketName)) {
          buckets.set(bucketName, new Map());
        }
        const bucket = buckets.get(bucketName)!;

        return {
          async upload(
            objectPath: string,
            data: Buffer,
            opts?: { contentType?: string; upsert?: boolean }
          ) {
            if (bucketName === 'dominion-media-staging' && options?.failStagingUpload) {
              return { data: null, error: { message: 'Simulated staging bucket failure' } };
            }
            if (bucketName === 'dominion-media-public' && options?.failPublicUpload) {
              return { data: null, error: { message: 'Simulated public bucket failure' } };
            }
            if (!opts?.upsert && bucket.has(objectPath)) {
              return { data: null, error: { message: 'Object already exists' } };
            }
            bucket.set(objectPath, {
              buffer: Buffer.from(data),
              contentType: opts?.contentType || 'application/octet-stream',
            });
            return { data: { path: objectPath }, error: null };
          },

          async download(objectPath: string) {
            const entry = bucket.get(objectPath);
            if (!entry) {
              return { data: null, error: { message: 'Object not found' } };
            }
            return {
              data: new Blob([new Uint8Array(entry.buffer)], { type: entry.contentType }),
              error: null,
            };
          },

          async remove(paths: string[]) {
            for (const p of paths) {
              bucket.delete(p);
            }
            return { data: paths.map((name) => ({ name })), error: null };
          },

          async createSignedUrl(objectPath: string, expiresIn: number) {
            if (!bucket.has(objectPath)) {
              return { data: null, error: { message: 'Object not found for signed URL' } };
            }
            return {
              data: {
                signedUrl: `https://mock-project.supabase.co/storage/v1/object/sign/${bucketName}/${objectPath}?token=signed-${expiresIn}`,
              },
              error: null,
            };
          },

          getPublicUrl(objectPath: string) {
            return {
              data: {
                publicUrl: `https://mock-project.supabase.co/storage/v1/object/public/${bucketName}/${objectPath}`,
              },
            };
          },
        };
      },
    },
  } as unknown as SupabaseClient;

  return { client, buckets };
}

const VALID_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
const VALID_JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);

describe('Supabase Media Storage Service', () => {
  let mockBuckets: Map<string, Map<string, InMemoryObject>>;

  beforeEach(() => {
    const mock = createMockSupabaseStorageClient();
    mockBuckets = mock.buckets;
    setSupabaseStorageClientForTests(mock.client);
  });

  afterEach(() => {
    setSupabaseStorageClientForTests(null);
  });

  it('has zero node:fs imports in production media-storage and supabase-client modules', () => {
    const mediaStorageSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/server/services/media-storage.ts'),
      'utf8'
    );
    const supabaseClientSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/server/storage/supabase-client.ts'),
      'utf8'
    );
    assert.ok(!mediaStorageSrc.includes('node:fs'));
    assert.ok(!supabaseClientSrc.includes('node:fs'));
  });

  it('rejects oversized files (> 5 MB) and invalid/malicious file formats before storage upload', () => {
    const oversized = Buffer.alloc(MAX_IMAGE_UPLOAD_BYTES + 1, 0xff);
    assert.throws(() => inspectImageBufferFormat(oversized), PayloadTooLargeError);

    const fakeExe = Buffer.from('MZ-executable-payload');
    assert.throws(() => inspectImageBufferFormat(fakeExe), UnsupportedMediaTypeError);

    const xssSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    assert.throws(() => inspectImageBufferFormat(xssSvg), UnsupportedMediaTypeError);
  });

  it('stages draft uploads in private bucket with signed URL and keeps public bucket empty', async () => {
    const stored = await storeUploadedImageBytes({
      buffer: VALID_PNG,
      publishImmediately: false,
    });

    assert.equal(stored.format, 'png');
    assert.ok(stored.storageKey.startsWith('media:'));
    assert.ok(stored.publicUrl.includes('/object/sign/dominion-media-staging/'));

    const objectPath = storageKeyToObjectPath(stored.storageKey)!;
    assert.equal(mockBuckets.get('dominion-media-staging')!.has(objectPath), true);
    assert.equal(mockBuckets.get('dominion-media-public')!.has(objectPath), false);
  });

  it('promotes to public bucket on publish and removes from public bucket when unpublished', async () => {
    const stored = await storeUploadedImageBytes({
      buffer: VALID_JPEG,
      publishImmediately: false,
    });
    const objectPath = storageKeyToObjectPath(stored.storageKey)!;

    // Publish
    const published = await syncMediaPublicVisibility({
      storageKey: stored.storageKey,
      isPubliclyVisible: true,
    });
    assert.ok(published.publicUrl?.includes('/object/public/dominion-media-public/'));
    assert.equal(mockBuckets.get('dominion-media-public')!.has(objectPath), true);

    // Unpublish -> removed from public bucket, retained in private staging bucket with signed URL
    const unpublished = await syncMediaPublicVisibility({
      storageKey: stored.storageKey,
      isPubliclyVisible: false,
    });
    assert.ok(unpublished.publicUrl?.includes('/object/sign/dominion-media-staging/'));
    assert.equal(mockBuckets.get('dominion-media-public')!.has(objectPath), false);
    assert.equal(mockBuckets.get('dominion-media-staging')!.has(objectPath), true);

    // Delete -> removed from both buckets
    await removeStoredMediaBytes(stored.storageKey);
    assert.equal(mockBuckets.get('dominion-media-staging')!.has(objectPath), false);
    assert.equal(mockBuckets.get('dominion-media-public')!.has(objectPath), false);
  });

  it('rolls back staging upload if immediate public bucket upload fails', async () => {
    const failingMock = createMockSupabaseStorageClient({ failPublicUpload: true });
    setSupabaseStorageClientForTests(failingMock.client);

    await assert.rejects(
      () =>
        storeUploadedImageBytes({
          buffer: VALID_PNG,
          publishImmediately: true,
        }),
      /Failed to publish uploaded image/i
    );

    assert.equal(failingMock.buckets.get('dominion-media-staging')!.size, 0);
    assert.equal(failingMock.buckets.get('dominion-media-public')!.size, 0);
  });

  it('preserves child-protection consent rules before publishing identifiable student media', () => {
    assert.throws(
      () =>
        assertGalleryImagePublishable({
          status: 'published',
          schoolApproved: true,
          identifiableStudents: true,
          approvalReference: null,
        }),
      ValidationError
    );
  });
});
