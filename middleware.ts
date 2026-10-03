import { NextRequest, NextResponse } from 'next/server';

// The public site can also be served from GitHub Pages (`npm run deploy`), which calls this
// server's public API from another origin. Allow those origins (CORS_ORIGINS, comma separated).
// Staff routes (/api/admin, /api/auth) stay same-origin only.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'https://craftmindai.github.io')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin');
  const { pathname } = req.nextUrl;
  // In development also allow a locally served Pages build (http://localhost:<port>)
  const allowed = !!origin && (ALLOWED_ORIGINS.includes(origin) || (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)));
  if (!allowed || pathname.startsWith('/api/admin') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const cors = {
    'Access-Control-Allow-Origin': origin!,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (req.method === 'OPTIONS') return new NextResponse(null, { status: 204, headers: cors });

  const res = NextResponse.next();
  for (const [key, value] of Object.entries(cors)) res.headers.set(key, value);
  return res;
}

export const config = { matcher: '/api/:path*' };
