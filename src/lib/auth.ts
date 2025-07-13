import { FirebaseError } from 'firebase/app'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth'
import { ref, set, get, serverTimestamp } from 'firebase/database'
import { auth, realtimeDb } from './firebase'
import type { UserProfile } from './types'

export async function signUp(email: string, password: string, name: string) {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
    const user = userCredential.user

    // Update the user's display name
    await updateProfile(user, { displayName: name })

    // Create the user profile in Realtime Database
    const userProfile: UserProfile = {
      id: user.uid,
      name: name,
      email: user.email || '',
      photoUrl: user.photoURL || null,
      bio: null,
      travelPreferences: {},
      languagesSpoken: [],
      trekkingExperience: 'Beginner',
      wishlistDestinations: [],
      travelHistory: [],
      plannedTrips: [],
      badges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    }

    await set(ref(realtimeDb, `users/${user.uid}`), userProfile)

    return { user, profile: userProfile }
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('Email is already registered')
        case 'auth/invalid-email':
          throw new Error('Invalid email address')
        case 'auth/weak-password':
          throw new Error('Password is too weak')
        default:
          throw new Error('Failed to create account')
      }
    }
    throw error
  }
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    const user = userCredential.user

    // Update last login time
    const userRef = ref(realtimeDb, `users/${user.uid}`)
    await set(userRef, { lastLoginAt: serverTimestamp() })

    // Get the user's profile
    const snapshot = await get(userRef)
    const profile = snapshot.val() as UserProfile

    return { user, profile }
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          throw new Error('Invalid email or password')
        case 'auth/too-many-requests':
          throw new Error('Too many failed attempts. Please try again later')
        default:
          throw new Error('Failed to sign in')
      }
    }
    throw error
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('No account found with this email')
        default:
          throw new Error('Failed to send password reset email')
      }
    }
    throw error
  }
}

export async function logout() {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw new Error('Failed to sign out')
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
