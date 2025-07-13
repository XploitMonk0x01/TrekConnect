
import {NextResponse} from 'next/server';
import {getOtherUsers} from '@/services/users'; // Using the Firebase service

export async function GET() {
  try {
    // In Firebase, there's no single "current user" on the server without auth context.
    // The service getOtherUsers requires a current user ID to exclude.
    // For a generic "get all users" endpoint, we'll fetch all and let the client filter if needed.
    // Assuming getOtherUsers with an empty string will fetch all users.
    const users = await getOtherUsers(''); // The service needs to handle this case gracefully

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500}
    );
  }
}
