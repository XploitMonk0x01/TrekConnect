import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'

// Prevent caching of this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const isAuthenticated = await isAdminAuthenticated()

    const res = NextResponse.json({ authenticated: isAuthenticated })

    // If cookie is missing/invalid, clear it to avoid endless client redirects
    if (!isAuthenticated) {
      res.cookies.set('admin_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      })
    }

    return res
  } catch (error) {
    console.error('Session check error:', error)

    const res = NextResponse.json({ authenticated: false })
    res.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return res
  }
}
