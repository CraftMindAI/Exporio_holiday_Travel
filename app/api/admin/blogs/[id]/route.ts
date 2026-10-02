import { after } from 'next/server';
import { removeUnusedImages } from '@/lib/media';
import { prisma } from '@/lib/prisma';
import { blogFromRow } from '@/lib/data';
import { blogInput, isNotFound, refreshSite } from '@/lib/adminInput';
import { adminRoute, fail, ok, readJson } from '@/lib/http';

type Params = { id: string };

/** PATCH /api/admin/blogs/:id */
export const PATCH = adminRoute<Params>(async (_admin, req, { params }) => {
  const { data, error } = blogInput(await readJson(req), 'update');
  if (error) return fail(error);
  const { id } = await params;
  const before = await prisma.blog.findUnique({ where: { id }, select: { imageUrl: true } });
  try {
    const blog = await prisma.blog.update({ where: { id }, data: data! });
    refreshSite();
    if (before && before.imageUrl !== blog.imageUrl) after(() => removeUnusedImages(before.imageUrl));
    return ok({ success: true, message: 'Blog updated successfully!', blog: blogFromRow(blog) });
  } catch (err) {
    if (isNotFound(err)) return fail('Blog not found.', 404);
    throw err;
  }
});

/** DELETE /api/admin/blogs/:id */
export const DELETE = adminRoute<Params>(async (_admin, _req, { params }) => {
  const { id } = await params;
  const before = await prisma.blog.findUnique({ where: { id }, select: { imageUrl: true } });
  try {
    await prisma.blog.delete({ where: { id } });
    refreshSite();
    if (before) after(() => removeUnusedImages(before.imageUrl));
    return ok({ success: true, message: 'Blog deleted successfully!' });
  } catch (err) {
    if (isNotFound(err)) return fail('Blog not found.', 404);
    throw err;
  }
});
