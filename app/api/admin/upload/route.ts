import { imageExtension, MAX_UPLOAD_BYTES, uploadImage } from '@/lib/ftp';
import { staffRoute, fail, ok } from '@/lib/http';

/** POST /api/admin/upload (multipart, field "file", optional "prefix") - upload an image to Hostinger via FTP. */
export const POST = staffRoute(async (_admin, req) => {
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return fail('Choose an image to upload.');

  const extension = imageExtension(file.type);
  if (!extension) return fail('Only JPG, PNG, WEBP, GIF or AVIF images can be uploaded.');
  if (file.size > MAX_UPLOAD_BYTES) return fail('Image is too large (max 5 MB).');

  const prefix = String(form?.get('prefix') ?? 'img').replace(/[^a-z0-9-]/gi, '').slice(0, 20) || 'img';
  const url = await uploadImage(Buffer.from(await file.arrayBuffer()), extension, prefix);
  return ok({ success: true, url }, 201);
});
