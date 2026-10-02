// Server-only image storage on Hostinger over FTP.
//   FTP_HOST / FTP_PORT / FTP_USER / FTP_PASSWORD  FTP account
//   FTP_UPLOAD_DIR                                 folder on that account for uploads (created if missing)
//
// Uploaded images are stored in the database as a path like "/media/blog-1712345-ab12cd.png".
// The app serves that path itself (app/media/[file]/route.ts), fetching the file from FTP once and
// caching it on disk, so images load no matter which (if any) website the FTP folder is mapped to.
import 'server-only';
import { randomBytes } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, rename, stat, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { Client } from 'basic-ftp';

export const MEDIA_PREFIX = '/media/';

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const CONTENT_TYPES: Record<string, string> = Object.fromEntries(Object.entries(ALLOWED_TYPES).map(([type, ext]) => [ext, type]));
CONTENT_TYPES.jpeg = 'image/jpeg';

/** Only names we generate: letters, digits, dash, underscore and one image extension. */
const SAFE_FILE = /^[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|gif|avif)$/i;

const CACHE_DIR = path.join(tmpdir(), 'exporio-media');

export function imageExtension(mimeType: string): string | null {
  return ALLOWED_TYPES[mimeType] ?? null;
}

export function mediaContentType(fileName: string): string | null {
  if (!SAFE_FILE.test(fileName)) return null;
  return CONTENT_TYPES[fileName.split('.').pop()!.toLowerCase()] ?? null;
}

async function connect(): Promise<Client> {
  const client = new Client(30_000);
  await client.access({
    host: (process.env.FTP_HOST ?? '').replace(/^ftps?:\/\//, ''),
    port: Number(process.env.FTP_PORT || 21),
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false,
  });
  if (process.env.FTP_UPLOAD_DIR) await client.ensureDir(process.env.FTP_UPLOAD_DIR);
  return client;
}

/** Upload image bytes under a random file name; returns the path to store, e.g. "/media/blog-...png". */
export async function uploadImage(data: Buffer, extension: string, prefix = 'img'): Promise<string> {
  const fileName = `${prefix}-${Date.now()}-${randomBytes(6).toString('hex')}.${extension}`;
  const client = await connect();
  try {
    await client.uploadFrom(Readable.from(data), fileName);
  } finally {
    client.close();
  }
  return `${MEDIA_PREFIX}${fileName}`;
}

/**
 * Local path of an uploaded image, downloading it from FTP into the disk cache on first use.
 * Returns null if the name is invalid or the file doesn't exist on FTP.
 */
export async function cachedImagePath(fileName: string): Promise<string | null> {
  if (!SAFE_FILE.test(fileName)) return null;

  const target = path.join(CACHE_DIR, fileName);
  try {
    if ((await stat(target)).size > 0) return target;
  } catch {
    // Not cached yet
  }

  await mkdir(CACHE_DIR, { recursive: true });
  // Download to a temp name first so a half-written file is never served
  const partial = `${target}.${randomBytes(4).toString('hex')}.part`;
  const client = await connect();
  try {
    await client.downloadTo(createWriteStream(partial), fileName);
    await rename(partial, target);
    return target;
  } catch (err: any) {
    await unlink(partial).catch(() => undefined);
    if (err?.code === 550) return null; // FTP "file not found"
    throw err;
  } finally {
    client.close();
  }
}

/** The file name of an uploaded image path ("/media/<file>"), or null for anything else (e.g. pasted external URLs). */
export function mediaFileName(url: string | null | undefined): string | null {
  if (!url?.startsWith(MEDIA_PREFIX)) return null;
  const fileName = url.slice(MEDIA_PREFIX.length);
  return SAFE_FILE.test(fileName) ? fileName : null;
}

/** Delete an uploaded image from FTP and from the local cache. A file that's already gone is not an error. */
export async function deleteImageFile(fileName: string): Promise<void> {
  if (!SAFE_FILE.test(fileName)) return;
  await unlink(path.join(CACHE_DIR, fileName)).catch(() => undefined);

  const client = await connect();
  try {
    await client.remove(fileName);
  } catch (err: any) {
    if (err?.code !== 550) throw err; // 550 = file not found
  } finally {
    client.close();
  }
}
