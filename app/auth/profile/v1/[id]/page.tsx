import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { adminProfilePath, getStaffUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

// Always check the session on the server; nothing here is cached
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

/** /auth/profile/v1/<hashed-user-id>/ - only the signed-in staff member (admin or employee) whose id hashes to <id> gets the dashboard. */
export default async function AdminProfilePage({ params }: Props) {
  const user = await getStaffUser();
  if (!user) redirect('/admin');

  const expected = adminProfilePath(user.id);
  if (`/auth/profile/v1/${(await params).id}/` !== expected) redirect(expected);

  return <AdminDashboard admin={{ id: user.id, name: user.name, email: user.email, phone: user.phone ?? '', role: user.role }} />;
}
