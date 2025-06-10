
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// Removed: validateToken from auth.service

export async function middleware(request: NextRequest) {
  // Firebase Authentication has been removed.
  // The previous token validation logic is no longer applicable.
  // You will need to implement new middleware logic based on your
  // custom MongoDB authentication system (e.g., validating a JWT stored in cookies).

  // For now, this middleware will allow all requests to pass through
  // to avoid blocking pages while the new auth system is being built.
  // console.log(`Middleware processing: ${request.nextUrl.pathname}`);

  // Example: Check for a custom auth token (replace 'customAuthToken' with your actual token name)
  // const customToken = request.cookies.get('customAuthToken')?.value;

  // if (request.nextUrl.pathname.startsWith('/profile') ||
  //     request.nextUrl.pathname.startsWith('/trips') ||
  //     request.nextUrl.pathname.startsWith('/messages') ||
  //     request.nextUrl.pathname.startsWith('/settings') ||
  //     request.nextUrl.pathname.startsWith('/feed/upload') ||
  //     request.nextUrl.pathname.startsWith('/stories/new')) {
  //   if (!customToken) {
  //     return NextResponse.redirect(new URL('/auth/signin', request.url));
  //   }
  //   // Here you would validate customToken against your backend /api/auth/validate
  // }

  return NextResponse.next();
}

// The matcher should be updated based on the routes you want to protect
// with your new custom authentication.
export const config = {
  matcher: [
    /*
    '/profile/:path*',
    '/trips/:path*',
    '/messages/:path*',
    '/settings/:path*',
    '/feed/upload/:path*',
    '/stories/new/:path*',
    */
    // Temporarily, you might want to disable the matcher or make it less restrictive
    // until the new auth system is in place.
    // For example, to allow all paths:
    // '/:path*'
  ],
}
