
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

// The incoming data type matches the form schema on the client
type UserProfileUpdateData = {
  name?: string;
  age?: number | string;
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Other' | 'Prefer not to say';
  bio?: string;
  photoUrl?: string; // This will be a base64 data URI if a new image is uploaded
  travelPreferences_soloOrGroup?: 'Solo' | 'Group' | 'Flexible';
  travelPreferences_budget?: 'Budget' | 'Mid-range' | 'Luxury' | 'Flexible';
  travelPreferences_style?: string;
  languagesSpoken?: string;
  trekkingExperience?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
};


export async function updateUserProfile(
  userId: string,
  dataToUpdate: UserProfileUpdateData
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
    const updatePayload: Partial<UserProfile> = {}

    // Map form data to the UserProfile structure
    if (dataToUpdate.name) updatePayload.name = dataToUpdate.name;
    if (dataToUpdate.age) updatePayload.age = Number(dataToUpdate.age);
    if (dataToUpdate.gender) updatePayload.gender = dataToUpdate.gender;
    if (dataToUpdate.bio !== undefined) updatePayload.bio = dataToUpdate.bio || null;
    
    // Specifically handle the new photo upload
    if (dataToUpdate.photoUrl && dataToUpdate.photoUrl.startsWith('data:image')) {
        updatePayload.photoUrl = dataToUpdate.photoUrl;
    }

    if (dataToUpdate.languagesSpoken !== undefined) {
        updatePayload.languagesSpoken = dataToUpdate.languagesSpoken.split(',').map(s => s.trim()).filter(s => s);
    }
    if (dataToUpdate.trekkingExperience) updatePayload.trekkingExperience = dataToUpdate.trekkingExperience;

    // Handle nested travelPreferences object
    const existingPrefs = snapshot.val().travelPreferences || {};
    const newPrefs = {
        soloOrGroup: dataToUpdate.travelPreferences_soloOrGroup,
        budget: dataToUpdate.travelPreferences_budget,
        style: dataToUpdate.travelPreferences_style,
    };
    // Only include travelPreferences in payload if there are changes
    if (Object.values(newPrefs).some(v => v !== undefined)) {
        updatePayload.travelPreferences = { ...existingPrefs, ...newPrefs };
    }

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
