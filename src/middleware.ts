
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose' 

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  console.error("CRITICAL: JWT_SECRET is not defined in the environment variables for middleware. This will cause authentication to fail.");
  throw new Error('JWT_SECRET is not defined in the environment variables for middleware')
}

interface JwtPayload {
  id: string
  email: string
  name: string
  iat: number
  exp: number
}

// Routes that require authentication
const protectedRoutes = [
  '/profile',
  '/settings',
  '/feed/upload',
  '/stories/new',
  '/connect',
  '/chat', 
  '/explore/routes/new', // Specific sub-route of explore that is protected
]

// Routes that should not be accessed when authenticated (redirect to home)
const authRoutes = ['/auth/signin', '/auth/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log(`Middleware: Processing path: ${pathname}`);
  console.log("Middleware JWT_SECRET:", JWT_SECRET ? "Loaded" : "MISSING OR EMPTY");


  // Get the auth token from cookies
  const authToken = request.cookies.get('authToken')?.value
  console.log("Middleware: authToken from cookie:", authToken ? `Present (length: ${authToken.length})` : "Not Present");

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => {
    // For /chat/[userId], ensure /chat matches
    if (route === '/chat' && pathname.startsWith('/chat/')) return true;
    return pathname.startsWith(route);
  });
  
  console.log(`Middleware: Is "${pathname}" a protected route? ${isProtectedRoute}`);


  // Check if it's an auth route (signin/signup)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    if (!authToken) {
      console.log(`Middleware: No authToken found for protected route ${pathname}. Redirecting to signin.`);
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(signInUrl)
    }

    try {
      const { payload } = await jwtVerify(
        authToken,
        new TextEncoder().encode(JWT_SECRET)
      )
      const decoded = payload as unknown as JwtPayload

      if (!decoded.id || !decoded.email) {
        console.log(`Middleware: Invalid token payload for ${pathname}. Redirecting to signin. Payload:`, decoded);
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('redirect', pathname)
        const response = NextResponse.redirect(signInUrl)
        response.cookies.delete('authToken') 
        return response
      }
      console.log(`Middleware: Token validated successfully for ${pathname}. User ID: ${decoded.id}`);
      return NextResponse.next()
    } catch (error: any) {
      console.error(`Middleware: JWT Verification Error for path "${pathname}". Token: "${authToken ? 'Exists' : 'Missing'}". Error:`, error);
      if (error.code === 'ERR_JWT_EXPIRED') {
        console.log(`Middleware: Token expired for ${pathname}.`)
      } else {
        console.log(`Middleware: Token validation failed for ${pathname}. Reason: ${error.message}`)
      }

      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(signInUrl)
      response.cookies.delete('authToken')
      return response
    }
  }

  if (isAuthRoute && authToken) {
    try {
      const { payload } = await jwtVerify(
        authToken,
        new TextEncoder().encode(JWT_SECRET)
      )
      const decoded = payload as unknown as JwtPayload
      if (decoded.id && decoded.email) {
        console.log(`Middleware: User already authenticated, redirecting from auth route ${pathname} to /.`);
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      console.log(`Middleware: Invalid token on auth route ${pathname}, allowing access. Clearing cookie. Error: ${ (error as Error).message}`);
      const response = NextResponse.next()
      response.cookies.delete('authToken')
      return response
    }
  }
  console.log(`Middleware: Allowing access to public or non-auth route: ${pathname}`);
  return NextResponse.next()
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
}
