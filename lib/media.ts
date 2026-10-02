// Server-only clean-up of uploaded images when the records using them are deleted or changed.
import 'server-only';
import { prisma } from '@/lib/prisma';
import { deleteImageFile, mediaFileName } from '@/lib/ftp';

/** True if any tour, place, blog or tour stop still uses this image. */
async function imageInUse(url: string): Promise<boolean> {
  const [tours, places, blogs, stops] = await Promise.all([
    prisma.tour.count({ where: { imageUrl: url } }),
    prisma.destination.count({ where: { imageUrl: url } }),
    prisma.blog.count({ where: { imageUrl: url } }),
    prisma.tourPlaceVisit.count({ where: { imageUrl: url } }),
  ]);
  return tours + places + blogs + stops > 0;
}

/**
 * Delete images from Hostinger FTP once nothing references them any more.
 * Only our own uploads ("/media/<file>") are touched; pasted external URLs are ignored.
 * Never throws: a failed clean-up is logged, the content change still succeeds.
 */
export async function removeUnusedImages(...urls: (string | null | undefined)[]): Promise<void> {
  for (const url of new Set(urls)) {
    const fileName = mediaFileName(url);
    if (!fileName || (await imageInUse(url!))) continue;
    try {
      await deleteImageFile(fileName);
    } catch (err) {
      console.error('[media] could not delete', fileName, 'from FTP:', err);
    }
  }
}
