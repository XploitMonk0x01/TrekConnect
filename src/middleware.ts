
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

// This is a simplified middleware for Firebase client-side authentication.
// It checks for a simple "isLoggedIn" cookie as a hint that a user has an active session.
// The actual, secure auth state is managed by the Firebase SDK on the client.

// Routes that require an authenticated session hint to access.
const protectedRoutes = [
  '/profile',
  '/settings',
  '/feed/upload',
  '/stories/new',
  '/connect',
  '/chat', // Covers /chat and /chat/[userId]
  '/explore/routes/new',
];

// Auth routes (e.g., sign-in, sign-up) that an authenticated user should be redirected away from.
const authRoutes = ['/auth/signin', '/auth/signup'];

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If trying to access a protected route without being logged in, redirect to sign-in.
  if (isProtectedRoute && !isLoggedIn) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('redirect', pathname); // Pass original path for post-login redirect
    return NextResponse.redirect(signInUrl);
  }

  // If trying to access a sign-in/sign-up page while already logged in, redirect to the dashboard.
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png (public asset)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)',
  ],
};
