// Shared app routes (safe to import from both server and browser code).

/** Staff (admin / employee) sign-in page. The old /admin address redirects here. */
export const STAFF_LOGIN_PATH = '/auth/profile/login/';

/** Folder the site is served from: '/Exporio_holiday_Travel' on GitHub Pages, '' on Hostinger (set in next.config.ts). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * Server that runs the API, admin and /media files. Empty on Hostinger (same server);
 * the GitHub Pages build points it at the Hostinger site (PAGES_API_URL in .env).
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

export const apiUrl = (path: string) => `${API_URL}${path}`;

/**
 * Standalone GitHub Pages demo (`npm run deploy` without PAGES_API_URL): no server at all.
 * Tours, places, blogs and images are saved into the site at build time; forms and sign-in are off.
 */
export const STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC_DEMO === '1';

/** Staff sign-in always happens on the server (GitHub Pages has no backend). */
export const STAFF_LOGIN_URL = apiUrl(STAFF_LOGIN_PATH);

/** Image src for display: uploaded files (/media/...) come from the API server, files in /public need the base path. */
export function mediaUrl(src: string | undefined | null): string {
  if (!src) return '';
  if (src.startsWith('/media/') && API_URL) return apiUrl(src);
  if (src.startsWith('/') && !src.startsWith('//')) return `${BASE_PATH}${src}`;
  return src;
}
