import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { cachedImagePath, mediaContentType } from '@/lib/ftp';

export const dynamic = 'force-dynamic';

/**
 * GET /media/:file - serve an uploaded image (stored on Hostinger FTP, cached on local disk).
 * File names are random and never reused, so browsers may cache them forever.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const contentType = mediaContentType(file);
  if (!contentType) return new Response('Not found', { status: 404 });

  try {
    const localPath = await cachedImagePath(file);
    if (!localPath) return new Response('Not found', { status: 404 });

    const { size } = await stat(localPath);
    const body = Readable.toWeb(createReadStream(localPath)) as ReadableStream;
    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(size),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('[media] could not load', file, err);
    return new Response('Image temporarily unavailable', { status: 502 });
  }
}
