
import {NextRequest, NextResponse} from 'next/server';
import {signUp as firebaseSignUp} from '@/lib/auth';
import {FirebaseError} from 'firebase/app';

export async function POST(request: NextRequest) {
  try {
    const {name, email, password} = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        {error: 'Name, email, and password are required.'},
        {status: 400}
      );
    }
    if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const user = await firebaseSignUp(name, email, password);

    // On successful sign-up, prepare a response to set the session cookie
     const response = NextResponse.json({
      id: user.uid,
      email: user.email,
      name: user.displayName,
    });

    // Set a cookie to indicate the user is logged in.
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
      return NextResponse.json({error: error.message}, {status: 400});
    }
     // Fallback for unexpected errors
    return NextResponse.json(
      {error: 'An unexpected error occurred during sign-up.'},
      {status: 500}
    );
  }
}
