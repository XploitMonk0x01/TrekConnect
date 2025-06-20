import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, decodeJwt } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables')
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
  '/trips',
  '/messages',
  '/settings',
  '/feed/upload',
  '/stories/new',
  '/connect',
  '/explore',
  '/recommendations',
]

// Routes that should not be accessed when authenticated (redirect to home)
const authRoutes = ['/auth/signin', '/auth/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow access to the home page
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if it's an auth route (signin/signup)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Get the auth token from cookies (since middleware runs on server)
  const authToken = request.cookies.get('authToken')?.value

  // If it's a protected route, validate the token
  if (isProtectedRoute) {
    if (!authToken) {
      // No token provided, redirect to signin
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    try {
      // Verify the JWT token using jose
      const { payload } = await jwtVerify(
        authToken,
        new TextEncoder().encode(JWT_SECRET)
      )
      const decoded = payload as unknown as JwtPayload

      // Check if the token has the required fields
      if (!decoded.id || !decoded.email) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }

      // Token is valid, continue with the request
      return NextResponse.next()
    } catch (error) {
      // Token is invalid or expired
      if (error instanceof Error && error.message.includes('expired')) {
        console.log('Token expired in middleware')
      } else {
        console.log('Token validation error in middleware:', error)
      }

      // Clear the invalid token cookie and redirect to signin page
      const response = NextResponse.redirect(
        new URL('/auth/signin', request.url)
      )
      response.cookies.delete('authToken')
      return response
    }
  }

  // If it's an auth route and user has a valid token, redirect to home
  if (isAuthRoute && authToken) {
    try {
      const { payload } = await jwtVerify(
        authToken,
        new TextEncoder().encode(JWT_SECRET)
      )
      const decoded = payload as unknown as JwtPayload
      if (decoded.id && decoded.email) {
        // User is already authenticated, redirect to home
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      // Token is invalid, clear it and continue to auth page
      const response = NextResponse.next()
      response.cookies.delete('authToken')
      return response
    }
  }

  // For all other routes, continue normally
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
