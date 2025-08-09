import type { UserProfile } from '@/lib/types'
import {
  getDatabase,
  ref,
  get,
  update,
  remove,
  query,
  orderByChild,
  limitToLast,
} from 'firebase/database'

// The incoming data type matches the form schema on the client
export type UserProfileUpdateData = {
  name?: string
  age?: number | string
  gender?: 'Male' | 'Female'
  bio?: string
  photoUrl?: string // This will be a base64 data URI if a new image is uploaded
  travelPreferences_soloOrGroup?: 'Solo' | 'Group' | 'Flexible'
  travelPreferences_budget?: 'Budget' | 'Mid-range' | 'Luxury' | 'Flexible'
  travelPreferences_style?: string
  languagesSpoken?: string
  trekkingExperience?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
}

// Client-side profile update function
export async function updateUserProfileClient(
  userId: string,
  dataToUpdate: UserProfileUpdateData
): Promise<void> {
  if (!userId) throw new Error('User ID is required')
  const db = getDatabase()
  const userRef = ref(db, `users/${userId}`)
  const updatePayload: any = {
    ...dataToUpdate,
    updatedAt: new Date().toISOString(),
  }
  await update(userRef, updatePayload)
}

// Client-side profile get function
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  if (!userId) return null
  const db = getDatabase()
  const userRef = ref(db, `users/${userId}`)
  const snapshot = await get(userRef)
  if (snapshot.exists()) {
    return { ...snapshot.val(), id: userId } as UserProfile
  }
  return null
}

// Client-side profile delete function
export async function deleteUserProfile(userId: string): Promise<boolean> {
  try {
    const db = getDatabase()
    const userRef = ref(db, `users/${userId}`)
    await remove(userRef)
    return true
  } catch (error) {
    console.error(`Error deleting user profile ${userId}:`, error)
    return false
  }
}

// Client-side function to get other users for connect page
export async function getOtherUsers(
  currentUserId: string
): Promise<UserProfile[]> {
  try {
    const db = getDatabase()
    const usersRef = ref(db, 'users')
    const snapshot = await get(usersRef)

    if (!snapshot.exists()) {
      return []
    }

    const allUsers = snapshot.val()
    const otherUsers: UserProfile[] = []

    // Filter out the current user and convert to array
    for (const [userId, userData] of Object.entries(allUsers)) {
      if (userId !== currentUserId && userData) {
        otherUsers.push({
          ...(userData as any),
          id: userId,
        } as UserProfile)
      }
    }

    // Shuffle the array to show users in random order
    for (let i = otherUsers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[otherUsers[i], otherUsers[j]] = [otherUsers[j], otherUsers[i]]
    }

    return otherUsers
  } catch (error) {
    console.error('Error fetching other users:', error)
    return []
  }
}
