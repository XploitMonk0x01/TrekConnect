import { NextRequest, NextResponse } from 'next/server'
import {
  signInWithEmailAndPassword,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json()

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the current user
    const currentUser = auth.currentUser
    if (!currentUser || currentUser.uid !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!currentUser.email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }

    // Re-authenticate the user with their current password
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    )
    await reauthenticateWithCredential(currentUser, credential)

    // Update the password
    await updatePassword(currentUser, newPassword)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Password change error:', error)

    // Handle specific Firebase errors
    if (error.code === 'auth/wrong-password') {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    } else if (error.code === 'auth/weak-password') {
      return NextResponse.json(
        { error: 'New password is too weak' },
        { status: 400 }
      )
    } else if (error.code === 'auth/requires-recent-login') {
      return NextResponse.json(
        {
          error:
            'Please sign out and sign in again before changing your password',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
