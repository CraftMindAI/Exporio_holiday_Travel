import { prisma } from '@/lib/prisma';
import { blogFromRow, slugify } from '@/lib/data';
import { blogInput, refreshSite, uniqueSlug } from '@/lib/adminInput';
import { adminRoute, fail, ok, readJson } from '@/lib/http';
import type { Prisma } from '@prisma/client';

/** POST /api/admin/blogs - publish a blog post. */
export const POST = adminRoute(async (_admin, req) => {
  const { data, error } = blogInput(await readJson(req), 'create');
  if (error) return fail(error);

  const slug = await uniqueSlug(slugify(String(data!.title)), async (s) => !!(await prisma.blog.findUnique({ where: { slug: s }, select: { id: true } })));
  const blog = await prisma.blog.create({ data: { ...(data as Prisma.BlogCreateInput), slug } });
  refreshSite();
  return ok({ success: true, message: 'Blog post published successfully!', blog: blogFromRow(blog) }, 201);
});
