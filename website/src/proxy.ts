import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/sessionCookie';

// First gate for the admin side: anyone without a session cookie is sent to
// /login before any /admin page renders. The admin layout then confirms the
// cookie with the backend (see requireAdmin in src/lib/session.ts).
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
