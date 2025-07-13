import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth'
import { ref, set, get, serverTimestamp, update } from 'firebase/database'
import { auth, realtimeDb } from './firebase'
import type { UserProfile } from './types'

// Helper to check if an error is a Firebase error by checking for the 'code' property.
function isFirebaseError(error: unknown): error is { code: string; message: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}


export async function signUp(name: string, email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
    const user = userCredential.user

    await updateProfile(user, { displayName: name })

    await createUserProfileInRTDB(user, name);

    return user;

  } catch (error) {
    if (isFirebaseError(error)) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('This email is already registered.')
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.')
        case 'auth/weak-password':
          throw new Error('Password is too weak. It must be at least 6 characters.')
        default:
          throw new Error('An unknown error occurred during sign-up.')
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

    // Update last login time in RTDB
    const userRef = ref(realtimeDb, `users/${user.uid}`)
    await update(userRef, { lastLoginAt: serverTimestamp() })

    return user;

  } catch (error) {
    if (isFirebaseError(error)) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          throw new Error('Invalid email or password.')
        case 'auth/too-many-requests':
          throw new Error('Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.')
        default:
          throw new Error('An unknown error occurred during sign-in.')
      }
    }
    throw error
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    if (isFirebaseError(error)) {
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('No account found with this email.')
        default:
          throw new Error('Failed to send password reset email.')
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
    throw new Error('Failed to sign out.')
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

// Fetches a user profile from the Realtime Database
export async function getUserProfileFromRTDB(userId: string): Promise<UserProfile | null> {
    const userRef = ref(realtimeDb, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        // Ensure id is set correctly from the key
        return { ...data, id: userId };
    }
    return null;
}

// Creates a new user profile in Realtime Database
export async function createUserProfileInRTDB(user: User, name?: string): Promise<UserProfile> {
    const userProfile: UserProfile = {
      id: user.uid,
      name: name || user.displayName || 'Trekker',
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

    const userRef = ref(realtimeDb, `users/${user.uid}`);
    await set(userRef, userProfile);
    return userProfile;
}
