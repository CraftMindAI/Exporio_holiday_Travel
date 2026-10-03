'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import AutoPopupForm from '@/components/AutoPopupForm';
import { STAFF_LOGIN_PATH } from '@/lib/routes';

/** Public site header/footer/widgets; the admin dashboard renders its own full-screen layout instead. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The dashboard (/auth/profile/v1/...) has its own full-screen layout; the sign-in page keeps the site chrome
  if (pathname?.startsWith('/auth/profile/v1/')) {
    return <main className="flex-1">{children}</main>;
  }

  // Staff sign-in page: no customer WhatsApp chat button
  const isSignIn = pathname?.replace(/\/?$/, '/') === STAFF_LOGIN_PATH;

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {!isSignIn && <WhatsAppWidget />}
      <AutoPopupForm />
    </>
  );
}
