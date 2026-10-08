import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('ops3_session')?.value;

  // 1. Public assets and auth endpoints never block
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/widget') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next();
  }

  // 2. If already logged in and visiting /login, redirect straight to /app
  // "dont show again signin page in there"
  if (pathname.startsWith('/login')) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/app', request.url));
    }
    return NextResponse.next();
  }

  // 3. If NOT logged in and scanning QR code / visiting /app (or root /):
  // Direct them to /login first so they can fill their details!
  if (!sessionCookie) {
    // Allow internal API fetches so nothing crashes
    if (pathname.startsWith('/api/')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Logged in user has full direct access to /app
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
