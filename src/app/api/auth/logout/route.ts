import { NextResponse } from 'next/server'

export async function POST() {
  // This server-side logout is called by the client-side signOut function in the AuthContext.
  // Since we are using Firebase client-side auth, the primary session management
  // happens on the client. This endpoint's main purpose is to confirm the logout action
  // on the server if needed, but it no longer needs to manage cookies.
  try {
    const response = NextResponse.json(
      { message: 'Logout confirmed by server' },
      { status: 200 }
    )
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error during logout confirmation' },
      { status: 500 }
    )
  }
}
