import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('ops3_session')?.value;

  // If already authenticated and user visits /login, redirect straight to /app
  // This satisfies: "if they fill their details they can get logged in and dont show again signin page in there"
  if (pathname.startsWith('/login') && sessionCookie) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  // Optional login / Open preview mode:
  // Anyone scanning the QR code or visiting the URL can freely view and explore /app
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
