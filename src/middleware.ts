import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateToken } from '@/services/auth/auth.service'

export async function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get('authToken')?.value

  // Check if user is trying to access protected routes
  if (
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/trips') ||
    request.nextUrl.pathname.startsWith('/messages')
  ) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    try {
      // Validate token
      await validateToken(token)
      return NextResponse.next()
    } catch (error) {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(
        new URL('/auth/signin', request.url)
      )
      response.cookies.delete('authToken')
      return response
    }
  }

  // For public routes
  return NextResponse.next()
}

export const config = {
  matcher: ['/profile/:path*', '/trips/:path*', '/messages/:path*'],
}
