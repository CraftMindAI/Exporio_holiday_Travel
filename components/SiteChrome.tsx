'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import AutoPopupForm from '@/components/AutoPopupForm';

/** Public site header/footer/widgets; the admin dashboard renders its own full-screen layout instead. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith('/auth/profile/')) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppWidget />
      <AutoPopupForm />
    </>
  );
}
