
'use server'

import type { UserProfile } from '@/lib/types'
import { ref, get, update, remove } from 'firebase/database'
import { realtimeDb } from '@/lib/firebase'
import { getUserProfileFromRTDB } from '@/lib/auth'

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

    const updatePayload: Partial<UserProfile> = {}

    // Directly use the photoUrl if it's a new data URI
    if (dataToUpdate.photoUrl && dataToUpdate.photoUrl.startsWith('data:image')) {
        updatePayload.photoUrl = dataToUpdate.photoUrl;
    }

    if (dataToUpdate.name) updatePayload.name = dataToUpdate.name;
    if (dataToUpdate.age) updatePayload.age = Number(dataToUpdate.age);
    if (dataToUpdate.gender) updatePayload.gender = dataToUpdate.gender;
    if (dataToUpdate.bio !== undefined) updatePayload.bio = dataToUpdate.bio || null;
    
    if (dataToUpdate.languagesSpoken !== undefined) {
        updatePayload.languagesSpoken = dataToUpdate.languagesSpoken.split(',').map(s => s.trim()).filter(s => s);
    }
    if (dataToUpdate.trekkingExperience) updatePayload.trekkingExperience = dataToUpdate.trekkingExperience;

    const existingPrefs = snapshot.val().travelPreferences || {};
    const prefsToUpdate: Partial<UserProfile['travelPreferences']> = {};
    if (dataToUpdate.travelPreferences_soloOrGroup) prefsToUpdate.soloOrGroup = dataToUpdate.travelPreferences_soloOrGroup;
    if (dataToUpdate.travelPreferences_budget) prefsToUpdate.budget = dataToUpdate.travelPreferences_budget;
    if (dataToUpdate.travelPreferences_style !== undefined) prefsToUpdate.style = dataToUpdate.travelPreferences_style;
    
    if (Object.keys(prefsToUpdate).length > 0) {
        updatePayload.travelPreferences = { ...existingPrefs, ...prefsToUpdate };
    }

    if (Object.keys(updatePayload).length > 0) {
        updatePayload.updatedAt = new Date().toISOString()
        await update(userRef, updatePayload)
    }

    // Return the (potentially) updated profile
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
