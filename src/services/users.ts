
'use server'

import type { UserProfile } from '@/lib/types'
import { ref, get, update, remove } from 'firebase/database'
import { realtimeDb } from '@/lib/firebase'
import { getUserProfileFromRTDB } from '@/lib/auth'

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  // This function now uses the centralized function from auth.ts
  return getUserProfileFromRTDB(userId)
}

export async function updateUserProfile(
  userId: string,
  dataToUpdate: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>
): Promise<UserProfile | null> {
  if (!userId) {
    console.error('updateUserProfile: User ID is missing')
    return null
  }

  try {
    const userRef = ref(realtimeDb, `users/${userId}`)
    const snapshot = await get(userRef)
    if (!snapshot.exists()) {
      return null // User not found, cannot update
    }

    // Create a payload with only the fields that are being updated.
    const updatePayload: { [key: string]: any } = {}
    const existingData = snapshot.val()

    // Directly assign fields if they exist in the input, allowing null to clear them.
    Object.keys(dataToUpdate).forEach((key) => {
      const typedKey = key as keyof typeof dataToUpdate
      // Handle nested travelPreferences object by merging
      if (typedKey === 'travelPreferences' && dataToUpdate.travelPreferences) {
        updatePayload.travelPreferences = {
          ...(existingData.travelPreferences || {}),
          ...dataToUpdate.travelPreferences,
        }
      } else {
        updatePayload[typedKey] = dataToUpdate[typedKey]
      }
    })

    // Always update the timestamp
    updatePayload.updatedAt = new Date().toISOString()

    // Perform the update
    await update(userRef, updatePayload)

    // Return the updated profile
    const updatedProfile = await getUserProfileFromRTDB(userId)
    return updatedProfile
  } catch (error: any) {
    console.error(
      `Error updating user profile for ID (${userId}):`,
      error.message
    )
    return null
  }
}

export async function getOtherUsers(
  currentUserId: string
): Promise<UserProfile[]> {
  try {
    const usersRef = ref(realtimeDb, 'users')
    const snapshot = await get(usersRef)

    if (snapshot.exists()) {
      const allUsers = snapshot.val()
      const userList: UserProfile[] = Object.keys(allUsers)
        .filter((uid) => uid !== currentUserId) // Exclude current user if ID is provided
        .map((uid) => ({ ...allUsers[uid], id: uid }))
      return userList
    }
    return []
  } catch (error) {
    console.error('Error fetching other users:', error)
    return []
  }
}

export async function deleteUserProfile(userId: string): Promise<boolean> {
  try {
    const userRef = ref(realtimeDb, `users/${userId}`)
    await remove(userRef)
    // Note: This only removes the RTDB profile.
    // The actual Firebase Auth user needs to be deleted separately,
    // which requires the Admin SDK on the backend. This is a more advanced setup.
    return true
  } catch (error) {
    console.error(`Error deleting user profile ${userId}:`, error)
    return false
  }
}
