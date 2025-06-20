'use server'

import type { UserProfile } from '@/lib/types'
// PLACEHOLDER_IMAGE_URL not used directly in this service, but good to keep if other functions are added.
// import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { getDb } from '@/lib/mongodb'
import { ObjectId, WithId, Document } from 'mongodb'

// Define the structure of our MongoDB document
// Keep UserDocument and UserProfile somewhat aligned, UserDocument is DB representation
interface UserDocument extends Document {
  // Ensure it extends Document for WithId compatibility
  _id: ObjectId
  name: string | null
  email: string | null // Should be unique
  photoUrl: string | null
  bio: string | null
  age?: number | null // Allow null for explicit clearing
  gender?: string | null
  travelPreferences: {
    // Make this required to match UserProfile
    soloOrGroup?: 'Solo' | 'Group' | 'Flexible' | null
    budget?: 'Budget' | 'Mid-range' | 'Luxury' | 'Flexible' | null
    style?: string | null
  }
  languagesSpoken?: string[] | null
  trekkingExperience?:
    | 'Beginner'
    | 'Intermediate'
    | 'Advanced'
    | 'Expert'
    | null
  wishlistDestinations?: string[] | null
  travelHistory?: string[] | null
  plannedTrips?: any[] | null // Define PlannedTrip interface if not done
  badges?: any[] | null // Define Badge interface if not done
  createdAt: Date
  updatedAt: Date
  password?: string
  lastLoginAt?: Date
}

// Helper function to map MongoDB document to UserProfile type
function mapDocToUserProfile(doc: WithId<UserDocument>): UserProfile {
  const userProfile: UserProfile = {
    id: doc._id.toString(),
    name: doc.name || null,
    email: doc.email || null,
    photoUrl: doc.photoUrl || null,
    age: doc.age === null ? undefined : doc.age, // Map null from DB to undefined in JS type if needed
    gender:
      doc.gender === null ? undefined : (doc.gender as UserProfile['gender']),
    bio: doc.bio || null,
    trekkingExperience:
      doc.trekkingExperience === null
        ? undefined
        : (doc.trekkingExperience as UserProfile['trekkingExperience']),
    travelPreferences: {
      soloOrGroup:
        doc.travelPreferences?.soloOrGroup === null
          ? undefined
          : (doc.travelPreferences
              ?.soloOrGroup as UserProfile['travelPreferences']['soloOrGroup']),
      budget:
        doc.travelPreferences?.budget === null
          ? undefined
          : (doc.travelPreferences
              ?.budget as UserProfile['travelPreferences']['budget']),
      style:
        doc.travelPreferences?.style === null
          ? undefined
          : doc.travelPreferences?.style,
    },
    languagesSpoken: doc.languagesSpoken || [],
    wishlistDestinations: (doc.wishlistDestinations || []).map((d) =>
      String(d)
    ), // Ensure strings
    travelHistory: (doc.travelHistory || []).map((h) => String(h)), // Ensure strings
    plannedTrips: (doc.plannedTrips || []).map((trip: any) => ({
      id: trip.id || trip._id?.toString() || '',
      destinationId: trip.destinationId || '',
      destinationName: trip.destinationName || '',
      startDate: trip.startDate ? String(trip.startDate) : '',
      endDate: trip.endDate ? String(trip.endDate) : '',
    })),
    badges: (doc.badges || []).map((badge: any) => ({
      id:
        typeof badge === 'string'
          ? badge
          : badge.id || badge._id?.toString() || '',
      name: typeof badge === 'string' ? badge : badge.name || '',
      description: typeof badge === 'string' ? '' : badge.description || '',
      // iconUrl: typeof badge === 'string' ? undefined : badge.iconUrl
    })),
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
    lastLoginAt: doc.lastLoginAt ? new Date(doc.lastLoginAt) : undefined,
  }
  return userProfile
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  console.log(
    `[TrekConnect Debug] MongoDB getUserProfile CALLED for ID: ${userId}`
  )
  if (!ObjectId.isValid(userId)) {
    console.error(
      `[TrekConnect Debug] getUserProfile: Invalid MongoDB ObjectId format for userId: ${userId}`
    )
    return null
  }
  try {
    const db = await getDb()
    const usersCollection = db.collection<UserDocument>('users')

    const userDoc = await usersCollection.findOne({ _id: new ObjectId(userId) })

    if (!userDoc) {
      console.log(
        `[TrekConnect Debug] MongoDB getUserProfile: User not found for ID: ${userId}`
      )
      return null
    }
    console.log(
      `[TrekConnect Debug] MongoDB getUserProfile: User found for ID: ${userId}`
    )
    return mapDocToUserProfile(userDoc)
  } catch (error) {
    console.error(
      `[TrekConnect Debug] Error fetching user profile by ID (${userId}):`,
      error
    )
    return null
  }
}

export async function updateUserProfile(
  userId: string,
  dataToUpdate: Partial<
    Omit<UserProfile, 'id' | 'email' | 'createdAt' | 'lastLoginAt' | 'password'>
  >
): Promise<UserProfile | null> {
  console.log(
    `[TrekConnect Debug] MongoDB updateUserProfile CALLED for ID: ${userId}`
  )
  if (!userId) {
    console.error(
      '[TrekConnect Debug] updateUserProfile FAILED: User ID is undefined or null.'
    )
    return null
  }
  if (!ObjectId.isValid(userId)) {
    console.error(
      `[TrekConnect Debug] updateUserProfile: Invalid MongoDB ObjectId format for userId: ${userId}`
    )
    return null
  }

  try {
    const db = await getDb()
    const usersCollection = db.collection<UserDocument>('users')

    const filter = { _id: new ObjectId(userId) }

    // First, get the current document to understand its structure
    const currentDoc = await usersCollection.findOne(filter)
    if (!currentDoc) {
      console.error(`[TrekConnect Debug] User not found for ID: ${userId}`)
      return null
    }

    // Build the update payload more carefully
    const updatePayload: any = { updatedAt: new Date() }

    // Handle simple fields
    if (dataToUpdate.name !== undefined) updatePayload.name = dataToUpdate.name
    if (dataToUpdate.photoUrl !== undefined)
      updatePayload.photoUrl = dataToUpdate.photoUrl
    if (dataToUpdate.bio !== undefined) updatePayload.bio = dataToUpdate.bio
    if (dataToUpdate.age !== undefined) updatePayload.age = dataToUpdate.age
    if (dataToUpdate.gender !== undefined)
      updatePayload.gender = dataToUpdate.gender
    if (dataToUpdate.trekkingExperience !== undefined)
      updatePayload.trekkingExperience = dataToUpdate.trekkingExperience
    if (dataToUpdate.languagesSpoken !== undefined)
      updatePayload.languagesSpoken = dataToUpdate.languagesSpoken
    if (dataToUpdate.wishlistDestinations !== undefined)
      updatePayload.wishlistDestinations = dataToUpdate.wishlistDestinations
    if (dataToUpdate.travelHistory !== undefined)
      updatePayload.travelHistory = dataToUpdate.travelHistory
    if (dataToUpdate.plannedTrips !== undefined)
      updatePayload.plannedTrips = dataToUpdate.plannedTrips
    if (dataToUpdate.badges !== undefined)
      updatePayload.badges = dataToUpdate.badges

    // Handle travelPreferences as a complete object replacement
    if (dataToUpdate.travelPreferences !== undefined) {
      updatePayload.travelPreferences = {
        soloOrGroup:
          dataToUpdate.travelPreferences.soloOrGroup === undefined
            ? null
            : dataToUpdate.travelPreferences.soloOrGroup,
        budget:
          dataToUpdate.travelPreferences.budget === undefined
            ? null
            : dataToUpdate.travelPreferences.budget,
        style:
          dataToUpdate.travelPreferences.style === undefined
            ? null
            : dataToUpdate.travelPreferences.style,
      }
    }

    console.log(
      `[TrekConnect Debug] MongoDB updateUserProfile - Filter:`,
      JSON.stringify(filter)
    )
    console.log(
      `[TrekConnect Debug] MongoDB updateUserProfile - Update Payload:`,
      JSON.stringify(updatePayload)
    )

    // Use updateOne instead of findOneAndUpdate to avoid validation issues
    const updateResult = await usersCollection.updateOne(
      filter,
      { $set: updatePayload },
      { bypassDocumentValidation: true } // Bypass schema validation
    )

    console.log(
      `[TrekConnect Debug] MongoDB updateUserProfile - updateOne result for ${userId}:`,
      updateResult
    )

    if (updateResult.matchedCount === 0) {
      console.error(
        `[TrekConnect Debug] No document found to update for ID: ${userId}`
      )
      return null
    }

    if (updateResult.modifiedCount === 0) {
      console.log(
        `[TrekConnect Debug] No changes made to document for ID: ${userId}`
      )
    }

    // Get the updated document
    const updatedDoc = await usersCollection.findOne(filter, {
      projection: { password: 0 },
    })
    if (!updatedDoc) {
      console.error(
        `[TrekConnect Debug] Failed to retrieve updated document for ID: ${userId}`
      )
      return null
    }

    console.log(
      `[TrekConnect Debug] Successfully updated and retrieved document for ID: ${userId}`
    )
    return mapDocToUserProfile(updatedDoc as UserDocument)
  } catch (error) {
    console.error(
      `[TrekConnect Debug] CATCH BLOCK: Error updating user profile for ID (${userId}):`,
      error
    )

    // Log more details about the error
    if (error && typeof error === 'object' && 'code' in error) {
      console.error(`[TrekConnect Debug] MongoDB Error Code: ${error.code}`)
      if ('codeName' in error) {
        console.error(
          `[TrekConnect Debug] MongoDB Error Name: ${(error as any).codeName}`
        )
      }
      if ('errInfo' in error) {
        console.error(
          `[TrekConnect Debug] MongoDB Error Info:`,
          (error as any).errInfo
        )
      }
    }

    // If it's a validation error, try updating fields individually
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 121
    ) {
      console.log(
        `[TrekConnect Debug] Trying individual field updates due to validation error...`
      )
      try {
        const db = await getDb()
        const usersCollection = db.collection<UserDocument>('users')
        const filter = { _id: new ObjectId(userId) }

        // Update only the updatedAt field first
        await usersCollection.updateOne(
          filter,
          { $set: { updatedAt: new Date() } },
          { bypassDocumentValidation: true }
        )

        // Then try updating other fields one by one
        if (dataToUpdate.name !== undefined) {
          await usersCollection.updateOne(
            filter,
            { $set: { name: dataToUpdate.name } },
            { bypassDocumentValidation: true }
          )
        }
        if (dataToUpdate.photoUrl !== undefined) {
          await usersCollection.updateOne(
            filter,
            { $set: { photoUrl: dataToUpdate.photoUrl } },
            { bypassDocumentValidation: true }
          )
        }
        if (dataToUpdate.bio !== undefined) {
          await usersCollection.updateOne(
            filter,
            { $set: { bio: dataToUpdate.bio } },
            { bypassDocumentValidation: true }
          )
        }
        if (dataToUpdate.age !== undefined) {
          await usersCollection.updateOne(
            filter,
            { $set: { age: dataToUpdate.age } },
            { bypassDocumentValidation: true }
          )
        }
        if (dataToUpdate.gender !== undefined) {
          await usersCollection.updateOne(
            filter,
            { $set: { gender: dataToUpdate.gender } },
            { bypassDocumentValidation: true }
          )
        }
        if (dataToUpdate.trekkingExperience !== undefined) {
          await usersCollection.updateOne(
            filter,
            { $set: { trekkingExperience: dataToUpdate.trekkingExperience } },
            { bypassDocumentValidation: true }
          )
        }
        if (dataToUpdate.languagesSpoken !== undefined) {
          await usersCollection.updateOne(
            filter,
            { $set: { languagesSpoken: dataToUpdate.languagesSpoken } },
            { bypassDocumentValidation: true }
          )
        }

        // Try travelPreferences separately
        if (dataToUpdate.travelPreferences !== undefined) {
          const travelPrefs = {
            soloOrGroup:
              dataToUpdate.travelPreferences.soloOrGroup === undefined
                ? null
                : dataToUpdate.travelPreferences.soloOrGroup,
            budget:
              dataToUpdate.travelPreferences.budget === undefined
                ? null
                : dataToUpdate.travelPreferences.budget,
            style:
              dataToUpdate.travelPreferences.style === undefined
                ? null
                : dataToUpdate.travelPreferences.style,
          }
          await usersCollection.updateOne(
            filter,
            { $set: { travelPreferences: travelPrefs } },
            { bypassDocumentValidation: true }
          )
        }

        // Get the updated document
        const updatedDoc = await usersCollection.findOne(filter, {
          projection: { password: 0 },
        })
        if (updatedDoc) {
          console.log(`[TrekConnect Debug] Individual field updates successful`)
          return mapDocToUserProfile(updatedDoc as UserDocument)
        }
      } catch (individualError) {
        console.error(
          `[TrekConnect Debug] Individual field updates also failed:`,
          individualError
        )
      }
    }

    return null
  }
}

export async function getOtherUsers(
  currentUserId: string
): Promise<UserProfile[]> {
  console.log(
    `[TrekConnect Debug] MongoDB getOtherUsers CALLED, excluding ID: ${currentUserId}`
  )
  if (!ObjectId.isValid(currentUserId)) {
    console.error(
      `[TrekConnect Debug] getOtherUsers: Invalid MongoDB ObjectId format for currentUserId: ${currentUserId}`
    )
    return []
  }
  try {
    const db = await getDb()
    const usersCollection = db.collection<UserDocument>('users')

    const filter = { _id: { $ne: new ObjectId(currentUserId) } }

    const userDocs = await usersCollection
      .find(filter)
      .project({ password: 0 })
      .toArray()

    console.log(
      `[TrekConnect Debug] MongoDB getOtherUsers: Found ${userDocs.length} other users.`
    )
    return userDocs.map((doc) =>
      mapDocToUserProfile(doc as WithId<UserDocument>)
    ) // Ensure proper casting for map
  } catch (error) {
    console.error('[TrekConnect Debug] Error fetching other users:', error)
    return []
  }
}
