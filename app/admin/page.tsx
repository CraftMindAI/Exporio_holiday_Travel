import { redirect } from 'next/navigation';
import { STAFF_LOGIN_PATH } from '@/lib/routes';

/** Old staff sign-in address: keep bookmarks and earlier emails working. */
export default function OldAdminLoginRedirect() {
  redirect(STAFF_LOGIN_PATH);
}
