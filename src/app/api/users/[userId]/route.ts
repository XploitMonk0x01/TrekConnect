import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile, deleteUserProfile } from '@/services/users'
import { auth } from '@/lib/firebase'
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { revalidateTag } from 'next/cache'

// Helper to check for authorization (is the request from the user themselves?)
// In a real app, this might involve more robust session/token validation.
// For now, it's a placeholder for the logic.
async function isAuthorized(
  request: NextRequest,
  targetUserId: string
): Promise<boolean> {
  // Since we are using Firebase client-side auth, the server-side authorization check
  // would typically involve verifying a Firebase ID token sent in the Authorization header.
  // For this project, we'll assume a simpler check or that client-side logic prevents unauthorized requests.
  // A full implementation would look something like this:
  // const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
  // if (!idToken) return false;
  // try {
  //   const decodedToken = await admin.auth().verifyIdToken(idToken);
  //   return decodedToken.uid === targetUserId;
  // } catch (error) {
  //   return false;
  // }
  return true // Placeholder for now
}

// GET a single user profile from Firebase RTDB
export async function GET(
  request: NextRequest,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const user = await getUserProfile(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Omit sensitive data if necessary before sending
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE a user profile and Firebase auth account
export async function DELETE(
  request: NextRequest,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    // Basic authorization check
    if (!(await isAuthorized(request, userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get the current Firebase user
    const currentUser = auth.currentUser
    if (!currentUser || currentUser.uid !== userId) {
      return NextResponse.json(
        { error: 'User not authenticated or user mismatch' },
        { status: 401 }
      )
    }

    // Delete user profile from database first
    const profileDeleted = await deleteUserProfile(userId)
    if (!profileDeleted) {
      console.warn(
        'Failed to delete user profile from database, but continuing with auth deletion'
      )
    }

    // Delete the Firebase auth account
    try {
      await deleteUser(currentUser)
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        return NextResponse.json(
          {
            error:
              'Please sign out and sign in again before deleting your account',
          },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
