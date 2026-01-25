import { NextRequest, NextResponse } from 'next/server'
import { validateAdminCredentials, createAdminSession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (process.env.NODE_ENV !== 'production') {
      console.log('Login attempt for:', username)
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const isValid = validateAdminCredentials(username, password)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Credentials valid:', isValid)
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session token
    const token = await createAdminSession()
    if (process.env.NODE_ENV !== 'production') {
      console.log('Session token created, length:', token.length)
    }

    // Create response with cookie
    const response = NextResponse.json({ success: true })

    // Extra defense-in-depth: never cache auth responses
    response.headers.set('Cache-Control', 'no-store')

    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    if (process.env.NODE_ENV !== 'production') {
      console.log('Cookie set on response')
    }
    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
