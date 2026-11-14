/**
 * Private-First Supabase Storage Media Service & File Content Inspector
 * Adheres to ADR-004, AE-03, AE-09, SEC-09, SEC-16, and FR-07.
 * Never trusts filename or browser Content-Type header alone; inspects magic bytes.
 * Zero local filesystem persistence in production runtime.
 */

import crypto from 'node:crypto';
import {
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
} from '@/domain/errors';
import {
  getSupabaseStorageAdminClient,
  getSupabaseStorageBuckets,
} from '../storage/supabase-client';

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour for admin preview of staged/unpublished media

export type DetectedImageFormat = 'jpeg' | 'png' | 'webp' | 'svg';

/**
 * Inspects actual file content bytes to verify allowed image format (SEC-09).
 */
export function inspectImageBufferFormat(buffer: Buffer): DetectedImageFormat {
  if (!buffer || buffer.length === 0) {
    throw new UnsupportedMediaTypeError('Uploaded file is empty.');
  }
  if (buffer.length > MAX_IMAGE_UPLOAD_BYTES) {
    throw new PayloadTooLargeError('Image file exceeds the 5 MB maximum upload size.');
  }

  // JPEG: FF D8 FF
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }

  // Safe SVG check (must contain <svg and must not contain <script or on* event handlers)
  const headText = buffer.subarray(0, Math.min(buffer.length, 4096)).toString('utf8');
  if (/<svg[\s>]/i.test(headText)) {
    const fullText = buffer.toString('utf8');
    if (/<script\b|\bon[a-z]+\s*=|javascript:/i.test(fullText)) {
      throw new UnsupportedMediaTypeError(
        'SVG file contains prohibited script or event-handler attributes.'
      );
    }
    return 'svg';
  }

  throw new UnsupportedMediaTypeError(
    'Unsupported image file format. Only verified JPEG, PNG, WebP, or safe SVG images are permitted.'
  );
}

const EXTENSION_BY_FORMAT: Record<DetectedImageFormat, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  svg: 'svg',
};

const MIME_BY_FORMAT: Record<DetectedImageFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

export function storageKeyToObjectPath(storageKey: string): string | null {
  if (!storageKey.startsWith('media:')) {
    return null;
  }
  const filename = storageKey.replace(/^media:/, '');
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return null;
  }
  return `gallery/${filename}`;
}

function inferContentTypeFromPath(objectPath: string): string {
  const ext = objectPath.split('.').pop()?.toLowerCase() || '';
  return MIME_BY_EXTENSION[ext] || 'application/octet-stream';
}

async function createStagingSignedUrl(objectPath: string): Promise<string> {
  const supabase = getSupabaseStorageAdminClient();
  const { stagingBucket } = getSupabaseStorageBuckets();
  const { data, error } = await supabase.storage
    .from(stagingBucket)
    .createSignedUrl(objectPath, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error(
      `Failed to generate signed preview URL for staged media: ${error?.message || 'unknown error'}`
    );
  }
  return data.signedUrl;
}

/**
 * Stages an uploaded image in the private Supabase bucket first,
 * and promotes a copy to the public bucket only if approved & published.
 */
export async function storeUploadedImageBytes(options: {
  buffer: Buffer;
  publishImmediately: boolean;
}): Promise<{
  storageKey: string;
  publicUrl: string;
  format: DetectedImageFormat;
}> {
  const format = inspectImageBufferFormat(options.buffer);
  const ext = EXTENSION_BY_FORMAT[format];
  const contentType = MIME_BY_FORMAT[format];
  const opaqueId = crypto.randomUUID();
  const filename = `${opaqueId}.${ext}`;
  const storageKey = `media:${filename}`;
  const objectPath = `gallery/${filename}`;

  const supabase = getSupabaseStorageAdminClient();
  const { stagingBucket, publicBucket } = getSupabaseStorageBuckets();

  const { error: stagingError } = await supabase.storage
    .from(stagingBucket)
    .upload(objectPath, options.buffer, {
      contentType,
      cacheControl: '3600',
      upsert: false,
    });

  if (stagingError) {
    throw new Error(
      `Failed to stage uploaded image in Supabase Storage: ${stagingError.message}`
    );
  }

  if (options.publishImmediately) {
    const { error: publicError } = await supabase.storage
      .from(publicBucket)
      .upload(objectPath, options.buffer, {
        contentType,
        cacheControl: '31536000',
        upsert: true,
      });

    if (publicError) {
      await supabase.storage.from(stagingBucket).remove([objectPath]).catch(() => {});
      throw new Error(
        `Failed to publish uploaded image to public Supabase bucket: ${publicError.message}`
      );
    }

    const { data } = supabase.storage.from(publicBucket).getPublicUrl(objectPath);
    return {
      storageKey,
      publicUrl: data.publicUrl,
      format,
    };
  }

  const signedUrl = await createStagingSignedUrl(objectPath);
  return {
    storageKey,
    publicUrl: signedUrl,
    format,
  };
}

/**
 * Synchronizes public Supabase Storage bucket availability with publication & approval state (AE-09, SEC-16).
 */
export async function syncMediaPublicVisibility(options: {
  storageKey: string;
  isPubliclyVisible: boolean;
}): Promise<{ publicUrl: string | null }> {
  const objectPath = storageKeyToObjectPath(options.storageKey);
  if (!objectPath) {
    // Built-in static placeholder assets remain in /public/placeholders
    return { publicUrl: null };
  }

  const supabase = getSupabaseStorageAdminClient();
  const { stagingBucket, publicBucket } = getSupabaseStorageBuckets();

  if (options.isPubliclyVisible) {
    const { data: downloaded, error: downloadError } = await supabase.storage
      .from(stagingBucket)
      .download(objectPath);

    if (downloadError || !downloaded) {
      throw new Error(
        `Failed to read staged image for publication: ${downloadError?.message || 'missing object'}`
      );
    }

    const buffer = Buffer.from(await downloaded.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(publicBucket)
      .upload(objectPath, buffer, {
        contentType: inferContentTypeFromPath(objectPath),
        cacheControl: '31536000',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(
        `Failed to publish image to public Supabase bucket: ${uploadError.message}`
      );
    }

    const { data } = supabase.storage.from(publicBucket).getPublicUrl(objectPath);
    return { publicUrl: data.publicUrl };
  }

  await supabase.storage.from(publicBucket).remove([objectPath]).catch(() => {});
  const signedUrl = await createStagingSignedUrl(objectPath);
  return { publicUrl: signedUrl };
}

/**
 * Deletes an image object from both public and private staging Supabase buckets.
 */
export async function removeStoredMediaBytes(storageKey: string): Promise<void> {
  const objectPath = storageKeyToObjectPath(storageKey);
  if (!objectPath) {
    return;
  }

  const supabase = getSupabaseStorageAdminClient();
  const { stagingBucket, publicBucket } = getSupabaseStorageBuckets();

  await Promise.all([
    supabase.storage.from(publicBucket).remove([objectPath]).catch(() => {}),
    supabase.storage.from(stagingBucket).remove([objectPath]).catch(() => {}),
  ]);
}
