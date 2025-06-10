
import { NextResponse } from 'next/server'
// Removed: sign, getDb. Custom OAuth flow needed.

// const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(req: Request) {
  // This route handled Google Sign-In by creating/finding a user in MongoDB
  // based on Firebase Auth details. Without Firebase Auth, a full custom
  // OAuth 2.0 flow with Google would be needed here, which is complex.
  // For now, this endpoint is disabled or needs to be re-implemented.
  console.warn('/api/auth/google POST endpoint called, but Firebase Auth is removed. Custom Google OAuth flow needed.');
  return NextResponse.json(
    { error: 'Google Sign-In via this endpoint is currently disabled. Custom OAuth flow required.' },
    { status: 501 } // Not Implemented
  );

  /*
  try {
    const { email, name, picture } = await req.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Custom logic to find or create user in MongoDB based on Google profile
    // This would not use Firebase UID anymore. A new strategy for linking
    // Google accounts to your custom user model is needed.
    // E.g., store google_id in user document.

    // const db = await getDb()
    // const usersCollection = db.collection('users')
    // let user = await usersCollection.findOne({ email }) // Or find by google_id
    // if (!user) {
    //   // Create new user
    // }

    // Create auth token for your custom system
    // const token = sign({ id: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })

    return NextResponse.json({ user: { /* user details *\/ }, token });
  } catch (error) {
    console.error('Custom Google sign in error (placeholder):', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
  */
}
