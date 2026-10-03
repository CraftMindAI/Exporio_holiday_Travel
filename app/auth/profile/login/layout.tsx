import type { Metadata } from 'next';
import { STAFF_LOGIN_PATH } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Staff Sign In',
  robots: { index: false, follow: false },
  alternates: { canonical: STAFF_LOGIN_PATH },
};

export default function StaffLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
