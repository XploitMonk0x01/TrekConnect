import {NextRequest, NextResponse} from 'next/server';
import {signIn} from '@/lib/auth'; // Firebase sign-in from lib/auth

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

    // The client-side Firebase SDK will handle auth persistence.
    // The API response just confirms success.
    const response = NextResponse.json({
      id: user.uid,
      email: user.email,
      name: user.displayName,
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
