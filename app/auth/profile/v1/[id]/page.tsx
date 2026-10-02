import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { adminProfilePath, getAdminUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

// Always check the session on the server; nothing here is cached
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

/** /auth/profile/v1/<hashed-admin-id>/ - only the signed-in admin whose id hashes to <id> gets the dashboard. */
export default async function AdminProfilePage({ params }: Props) {
  const admin = await getAdminUser();
  if (!admin) redirect('/admin');

  const expected = adminProfilePath(admin.id);
  if (`/auth/profile/v1/${(await params).id}/` !== expected) redirect(expected);

  return <AdminDashboard admin={{ id: admin.id, name: admin.name, email: admin.email, phone: admin.phone ?? '' }} />;
}
