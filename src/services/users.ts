
'use server'

import type { UserProfile } from '@/lib/types'
import { getDb } from '@/lib/mongodb'
import { ObjectId, WithId, Document } from 'mongodb'

interface UserDocument extends Document {
  _id: ObjectId
  name: string | null
  email: string | null
  photoUrl: string | null
  bio: string | null
  age?: number | null
  gender?: string | null
  travelPreferences: {
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
  plannedTrips?: any[] | null
  badges?: any[] | null
  createdAt: Date
  updatedAt: Date
  password?: string
  lastLoginAt?: Date
}

function mapDocToUserProfile(doc: WithId<UserDocument>): UserProfile {
  const userProfile: UserProfile = {
    id: doc._id.toString(),
    name: doc.name || null,
    email: doc.email || null,
    photoUrl: doc.photoUrl || null,
    age: doc.age === null ? undefined : doc.age,
    gender:
      doc.gender === null ? undefined : (doc.gender as UserProfile['gender']),
    bio: doc.bio || null,
    trekkingExperience:
      doc.trekkingExperience === null
        ? undefined
        : (doc.trekkingExperience as UserProfile['trekkingExperience']),
    travelPreferences: {
      soloOrGroup:
        doc.travelPreferences?.soloOrGroup === null || doc.travelPreferences?.soloOrGroup === undefined
          ? undefined
          : (doc.travelPreferences
              ?.soloOrGroup as UserProfile['travelPreferences']['soloOrGroup']),
      budget:
        doc.travelPreferences?.budget === null || doc.travelPreferences?.budget === undefined
          ? undefined
          : (doc.travelPreferences
              ?.budget as UserProfile['travelPreferences']['budget']),
      style:
        doc.travelPreferences?.style === null || doc.travelPreferences?.style === undefined
          ? undefined
          : doc.travelPreferences?.style,
    },
    languagesSpoken: doc.languagesSpoken || [],
    wishlistDestinations: (doc.wishlistDestinations || []).map((d) =>
      String(d)
    ),
    travelHistory: (doc.travelHistory || []).map((h) => String(h)),
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
  if (!ObjectId.isValid(userId)) {
    console.error(
      `getUserProfile: Invalid MongoDB ObjectId format for userId: ${userId}`
    )
    return null
  }
  try {
    const db = await getDb()
    const usersCollection = db.collection<UserDocument>('users')
    const userDoc = await usersCollection.findOne({ _id: new ObjectId(userId) })

    if (!userDoc) {
      return null
    }
    return mapDocToUserProfile(userDoc)
  } catch (error) {
    console.error(
      `Error fetching user profile by ID (${userId}):`,
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
  if (!userId || !ObjectId.isValid(userId)) {
    console.error(
      `updateUserProfile: User ID is invalid or missing: ${userId}`
    )
    return null
  }

  try {
    const db = await getDb()
    const usersCollection = db.collection<UserDocument>('users')
    const filter = { _id: new ObjectId(userId) }

    const updatePayload: any = { updatedAt: new Date() }

    // Helper function to add field to payload if it's explicitly provided in dataToUpdate
    // (i.e., key exists, value can be a value or null for clearing)
    const processField = (fieldName: keyof typeof dataToUpdate) => {
      if (Object.prototype.hasOwnProperty.call(dataToUpdate, fieldName)) {
        updatePayload[fieldName] = dataToUpdate[fieldName];
      }
    };

    processField('name');
    processField('photoUrl');
    processField('bio');
    processField('age');
    processField('gender');
    processField('trekkingExperience');
    processField('languagesSpoken');
    processField('wishlistDestinations');
    processField('travelHistory');
    processField('plannedTrips');
    processField('badges');
    
    if (dataToUpdate.travelPreferences) {
      const tpUpdate: any = {};
      let hasTpUpdate = false;
      if (Object.prototype.hasOwnProperty.call(dataToUpdate.travelPreferences, 'soloOrGroup')) {
        tpUpdate.soloOrGroup = dataToUpdate.travelPreferences.soloOrGroup;
        hasTpUpdate = true;
      }
      if (Object.prototype.hasOwnProperty.call(dataToUpdate.travelPreferences, 'budget')) {
        tpUpdate.budget = dataToUpdate.travelPreferences.budget;
        hasTpUpdate = true;
      }
      if (Object.prototype.hasOwnProperty.call(dataToUpdate.travelPreferences, 'style')) {
        tpUpdate.style = dataToUpdate.travelPreferences.style;
        hasTpUpdate = true;
      }
      if (hasTpUpdate) {
         // Merge with existing preferences if any, or set new ones
        updatePayload['travelPreferences'] = tpUpdate;
      }
    }
    
    // Remove updatedAt from $set if it's the only field to prevent empty updates if nothing else changed
    if (Object.keys(updatePayload).length === 1 && updatePayload.updatedAt) {
        // No actual fields were changed other than the timestamp we'd add
        const existingUser = await usersCollection.findOne(filter, { projection: { _id: 1 } });
        if (existingUser) return mapDocToUserProfile(existingUser as UserDocument); // Return existing if no actual update
        return null; // Should not happen if ID is valid
    }


    const updateResult = await usersCollection.updateOne(
      filter,
      { $set: updatePayload }
    );

    if (updateResult.matchedCount === 0) {
      return null;
    }

    const updatedDoc = await usersCollection.findOne(filter, {
      projection: { password: 0 },
    });
    if (!updatedDoc) {
      return null;
    }
    return mapDocToUserProfile(updatedDoc as UserDocument);
  } catch (error: any) {
     console.error(`Error updating user profile for ID (${userId}):`, error.message);
     if (error.code === 121) { // MongoDB Document failed validation
         console.error("MongoDB schema validation failed. Details:", error.errInfo?.details);
     }
    return null;
  }
}

export async function getOtherUsers(
  currentUserId: string
): Promise<UserProfile[]> {
  if (!ObjectId.isValid(currentUserId)) {
    console.error(
      `getOtherUsers: Invalid MongoDB ObjectId format for currentUserId: ${currentUserId}`
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
      .limit(50) // Add a limit for performance
      .toArray()

    return userDocs.map((doc) =>
      mapDocToUserProfile(doc as WithId<UserDocument>)
    )
  } catch (error) {
    console.error('Error fetching other users:', error)
    return []
  }
}
