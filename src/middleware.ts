import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

// This middleware redirects users who are already logged in away from auth pages.
// Route protection for unauthenticated users is now handled on the client-side
// using the useCustomAuth hook, which is more reliable with Firebase's client-side SDK.

// Auth routes (e.g., sign-in, sign-up) that an authenticated user should be redirected away from.
const authRoutes = ['/auth/signin', '/auth/signup'];

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  // The 'isLoggedIn' cookie is now the one set by Firebase's SDK, which is more reliable.
  // We check for any cookie that indicates a Firebase session.
  // A common (but not guaranteed) one is `firebase-id-token`.
  // A simple check for a cookie named like a Firebase auth user is often sufficient
  // to prevent a logged-in user from seeing the sign-in page.
  const hasFirebaseSession = Object.keys(request.cookies).some(name =>
    name.startsWith('firebase:authUser')
  );

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If trying to access a sign-in/sign-up page while already logged in, redirect to the dashboard.
  if (isAuthRoute && hasFirebaseSession) {
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
