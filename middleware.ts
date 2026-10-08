import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that do not require authentication
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') || // covers /login, /logout, /me, /register
    pathname.startsWith('/api/widget') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/robots.txt'
  ) {
    // If user is already authenticated and visits /login, redirect to /app
    const sessionCookie = request.cookies.get('ops3_session')?.value;
    if (pathname.startsWith('/login') && sessionCookie) {
      return NextResponse.redirect(new URL('/app', request.url));
    }
    return NextResponse.next();
  }

  // Check session cookie
  const sessionCookie = request.cookies.get('ops3_session')?.value;

  if (!sessionCookie) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }
    // Redirect unauthenticated web page visits to /login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Basic format validation: base64urlData.signature
  const parts = sessionCookie.split('.');
  if (parts.length !== 2) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('ops3_session');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
