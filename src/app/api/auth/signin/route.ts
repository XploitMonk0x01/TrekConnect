
import {NextRequest, NextResponse} from 'next/server';
import {signIn} from '@/lib/auth'; // Firebase sign-in from lib/auth
import {FirebaseError} from 'firebase/app';

export async function POST(request: NextRequest) {
  try {
    const {email, password} = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {error: 'Email and password are required.'},
        {status: 400}
      );
    }

    const user = await signIn(email, password);

    // On successful sign-in, prepare a response to set the session cookie
    const response = NextResponse.json({
      id: user.uid,
      email: user.email,
      name: user.displayName,
    });

    // Set a cookie to indicate the user is logged in.
    // This is a simple flag for the middleware.
    // The actual auth state is managed by the Firebase SDK on the client.
    response.cookies.set('isLoggedIn', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      // The error messages from lib/auth are user-friendly
      return NextResponse.json({error: error.message}, {status: 401});
    }
    // Fallback for unexpected errors
    return NextResponse.json(
      {error: 'An unexpected error occurred.'},
      {status: 500}
    );
  }
}
