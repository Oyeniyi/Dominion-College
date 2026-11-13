/**
 * Private-First Media Storage & File Content Inspector
 * Adheres to ADR-004, AE-03, AE-09, SEC-09, SEC-16, and FR-07.
 * Never trusts filename or browser Content-Type header alone; inspects magic bytes.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PayloadTooLargeError, UnsupportedMediaTypeError } from '@/domain/errors';
import { getServerConfig } from '../config';

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

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

/**
 * Stages an uploaded image privately first, and promotes to public storage only if approved & published.
 */
export function storeUploadedImageBytes(options: {
  buffer: Buffer;
  publishImmediately: boolean;
}): {
  storageKey: string;
  publicUrl: string;
  format: DetectedImageFormat;
} {
  const format = inspectImageBufferFormat(options.buffer);
  const ext = EXTENSION_BY_FORMAT[format];
  const opaqueId = crypto.randomUUID();
  const filename = `${opaqueId}.${ext}`;
  const storageKey = `media:${filename}`;

  const config = getServerConfig();
  fs.mkdirSync(config.mediaStagingDir, { recursive: true });
  fs.mkdirSync(config.mediaPublicDir, { recursive: true });

  const stagingFilePath = path.join(config.mediaStagingDir, filename);
  fs.writeFileSync(stagingFilePath, options.buffer);

  if (options.publishImmediately) {
    const publicFilePath = path.join(config.mediaPublicDir, filename);
    fs.copyFileSync(stagingFilePath, publicFilePath);
  }

  return {
    storageKey,
    publicUrl: `/uploads/${filename}`,
    format,
  };
}

/**
 * Synchronizes public rendition availability with publication & approval state (AE-09, SEC-16).
 */
export function syncMediaPublicVisibility(options: {
  storageKey: string;
  isPubliclyVisible: boolean;
}): void {
  if (!options.storageKey.startsWith('media:')) {
    // Built-in static placeholder assets remain in /public/placeholders
    return;
  }
  const filename = options.storageKey.replace(/^media:/, '');
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return;
  }

  const config = getServerConfig();
  const stagingPath = path.join(config.mediaStagingDir, filename);
  const publicPath = path.join(config.mediaPublicDir, filename);

  if (options.isPubliclyVisible) {
    if (fs.existsSync(stagingPath)) {
      fs.mkdirSync(config.mediaPublicDir, { recursive: true });
      fs.copyFileSync(stagingPath, publicPath);
    }
  } else {
    if (fs.existsSync(publicPath)) {
      try {
        fs.unlinkSync(publicPath);
      } catch {
        // Ignore if already removed
      }
    }
  }
}

export function removeStoredMediaBytes(storageKey: string): void {
  if (!storageKey.startsWith('media:')) {
    return;
  }
  const filename = storageKey.replace(/^media:/, '');
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return;
  }
  const config = getServerConfig();
  const stagingPath = path.join(config.mediaStagingDir, filename);
  const publicPath = path.join(config.mediaPublicDir, filename);

  for (const filePath of [publicPath, stagingPath]) {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // Ignore cleanup error
      }
    }
  }
}

