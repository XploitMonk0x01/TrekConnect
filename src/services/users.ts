'use server'

import type { User as FirebaseUser } from 'firebase/auth'
import type { UserProfile } from '@/lib/types'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'

// Define the structure of our MongoDB document
interface UserDocument {
  _id: string
  firebaseUid?: string | null
  name: string | null
  email: string | null
  photoUrl: string | null
  bio: string | null
  age: number | null | undefined
  gender: string | null | undefined
  travelPreferences: {
    soloOrGroup?: string | null
    budget?: string | null
    style?: string | null
  }
  languagesSpoken: string[]
  trekkingExperience:
    | 'Beginner'
    | 'Intermediate'
    | 'Advanced'
    | 'Expert'
    | null
    | undefined
  wishlistDestinations: string[]
  travelHistory: string[]
  plannedTrips: string[]
  badges: string[]
  createdAt: Date
  updatedAt: Date
}

// Helper function to map MongoDB document to UserProfile type
function mapDocToUserProfile(doc: UserDocument): UserProfile {
  console.log(
    `[TrekConnect Debug] mapDocToUserProfile CALLED. Input doc:`,
    JSON.stringify(doc)
  )
  const userProfile: UserProfile = {
    id: doc._id.toString(), // _id will now consistently be the Firebase UID
    firebaseUid: doc.firebaseUid ?? '',
    name: doc.name || null,
    email: doc.email || null,
    photoUrl: doc.photoUrl === undefined ? null : doc.photoUrl,
    age: doc.age ?? undefined,
    gender: doc.gender ?? undefined,
    bio: doc.bio ?? undefined,
    trekkingExperience: doc.trekkingExperience ?? undefined,
    travelPreferences: {
      soloOrGroup:
        doc.travelPreferences?.soloOrGroup === null
          ? undefined
          : (doc.travelPreferences?.soloOrGroup as
              | 'Solo'
              | 'Group'
              | 'Flexible'
              | undefined),
      budget:
        doc.travelPreferences?.budget === null
          ? undefined
          : (doc.travelPreferences?.budget as
              | 'Flexible'
              | 'Budget'
              | 'Mid-range'
              | 'Luxury'
              | undefined),
      style:
        doc.travelPreferences?.style === null
          ? undefined
          : doc.travelPreferences?.style,
    },
    languagesSpoken: doc.languagesSpoken || [],
    wishlistDestinations: doc.wishlistDestinations || [],
    travelHistory: doc.travelHistory || [],
    plannedTrips: (doc.plannedTrips || []).map((trip: any) => ({
      id: trip.id || trip._id || '',
      destinationId: trip.destinationId || '',
      destinationName: trip.destinationName || '',
      startDate: trip.startDate ? String(trip.startDate) : '',
      endDate: trip.endDate ? String(trip.endDate) : '',
      // Optionally add other fields if PlannedTrip has more
    })),
    badges: (doc.badges || []).map((badge) => ({
      id: badge,
      name: badge,
      description: '', // Provide a default or fetch the real description if available
    })),
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  }
  console.log(
    `[TrekConnect Debug] Mapped UserProfile:`,
    JSON.stringify(userProfile)
  )
  return userProfile
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  console.log(`[TrekConnect Debug] getUserProfile CALLED for UID: ${uid}`)
  try {
    const res = await fetch(`/api/users/${uid}`)

    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      throw new Error('Failed to fetch user profile')
    }

    const userDoc = await res.json()

    return mapDocToUserProfile(userDoc)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function upsertUserFromFirebase(
  firebaseUser: FirebaseUser
): Promise<UserProfile | null> {
  console.log(
    `[TrekConnect Debug] upsertUserFromFirebase CALLED for UID: ${firebaseUser.uid}, Email: ${firebaseUser.email}, Name: ${firebaseUser.displayName}, Photo: ${firebaseUser.photoURL}`
  )

  if (!firebaseUser.uid) {
    console.error('[TrekConnect Debug] ERROR: No UID provided for user upsert')
    return null
  }

  try {
    const res = await fetch(`/api/users/${firebaseUser.uid}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: firebaseUser.displayName || null,
        email: firebaseUser.email || null,
        photoUrl: firebaseUser.photoURL || null,
        // other fields can be added here if needed
      }),
    })

    if (!res.ok) {
      throw new Error('Failed to upsert user profile')
    }

    const updatedUserDoc = await res.json()

    return mapDocToUserProfile(updatedUserDoc)
  } catch (error) {
    console.error(
      `[TrekConnect Debug] CATCH BLOCK: Error in upsertUserFromFirebase for UID (${firebaseUser.uid}):`,
      error
    )
    return null
  }
}

export async function updateUserProfile(
  uid: string,
  dataToUpdate: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>
): Promise<UserProfile | null> {
  console.log(`[TrekConnect Debug] updateUserProfile CALLED for UID: ${uid}`)
  if (!uid) {
    console.error(
      '[TrekConnect Debug] updateUserProfile PRE-CHECK FAILED: UID is undefined or null.'
    )
    return null
  }

  try {
    const res = await fetch(`/api/users/${uid}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToUpdate),
    })

    if (!res.ok) {
      throw new Error('Failed to update user profile')
    }

    const updatedUserDoc = await res.json()

    return mapDocToUserProfile(updatedUserDoc)
  } catch (error) {
    console.error(
      `[TrekConnect Debug] CATCH BLOCK: Error updating user profile for UID (${uid}):`,
      error
    )
    return null
  }
}

export async function getOtherUsers(
  currentUserId: string
): Promise<UserProfile[]> {
  try {
    const res = await fetch('/api/users')

    if (!res.ok) {
      throw new Error('Failed to fetch users')
    }

    const users = await res.json()
    return users.filter((user: UserProfile) => user.id !== currentUserId)
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}
