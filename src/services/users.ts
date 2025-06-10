
'use server'

import type { UserProfile } from '@/lib/types'
// PLACEHOLDER_IMAGE_URL not used directly in this service, but good to keep if other functions are added.
// import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { getDb } from '@/lib/mongodb';
import { ObjectId, WithId, Document } from 'mongodb';


// Define the structure of our MongoDB document
// Keep UserDocument and UserProfile somewhat aligned, UserDocument is DB representation
interface UserDocument extends Document { // Ensure it extends Document for WithId compatibility
  _id: ObjectId; 
  name: string | null;
  email: string | null; // Should be unique
  photoUrl: string | null;
  bio: string | null;
  age?: number | null; // Allow null for explicit clearing
  gender?: string | null;
  travelPreferences?: { // Ensure this object itself can be undefined or null
    soloOrGroup?: 'Solo' | 'Group' | 'Flexible' | null;
    budget?: 'Budget' | 'Mid-range' | 'Luxury' | 'Flexible' | null;
    style?: string | null;
  } | null;
  languagesSpoken?: string[] | null;
  trekkingExperience?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | null;
  wishlistDestinations?: string[] | null; 
  travelHistory?: string[] | null; 
  plannedTrips?: any[] | null; // Define PlannedTrip interface if not done
  badges?: any[] | null; // Define Badge interface if not done
  createdAt: Date;
  updatedAt: Date;
  password?: string; 
  lastLoginAt?: Date;
}

// Helper function to map MongoDB document to UserProfile type
function mapDocToUserProfile(doc: WithId<UserDocument>): UserProfile {
  const userProfile: UserProfile = {
    id: doc._id.toString(),
    name: doc.name || null,
    email: doc.email || null,
    photoUrl: doc.photoUrl || null, 
    age: doc.age === null ? undefined : doc.age, // Map null from DB to undefined in JS type if needed
    gender: doc.gender === null ? undefined : doc.gender as UserProfile['gender'],
    bio: doc.bio || null, 
    trekkingExperience: doc.trekkingExperience === null ? undefined : doc.trekkingExperience as UserProfile['trekkingExperience'],
    travelPreferences: {
      soloOrGroup: doc.travelPreferences?.soloOrGroup === null ? undefined : doc.travelPreferences?.soloOrGroup as UserProfile['travelPreferences']['soloOrGroup'],
      budget: doc.travelPreferences?.budget === null ? undefined : doc.travelPreferences?.budget as UserProfile['travelPreferences']['budget'],
      style: doc.travelPreferences?.style === null ? undefined : doc.travelPreferences?.style,
    },
    languagesSpoken: doc.languagesSpoken || [],
    wishlistDestinations: (doc.wishlistDestinations || []).map(d => String(d)), // Ensure strings
    travelHistory: (doc.travelHistory || []).map(h => String(h)), // Ensure strings
    plannedTrips: (doc.plannedTrips || []).map((trip: any) => ({
      id: trip.id || trip._id?.toString() || '',
      destinationId: trip.destinationId || '',
      destinationName: trip.destinationName || '',
      startDate: trip.startDate ? String(trip.startDate) : '',
      endDate: trip.endDate ? String(trip.endDate) : '',
    })),
    badges: (doc.badges || []).map((badge: any) => ({ 
      id: typeof badge === 'string' ? badge : badge.id || badge._id?.toString() || '',
      name: typeof badge === 'string' ? badge : badge.name || '',
      description: typeof badge === 'string' ? '' : badge.description || '',
      // iconUrl: typeof badge === 'string' ? undefined : badge.iconUrl
    })),
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
    lastLoginAt: doc.lastLoginAt ? new Date(doc.lastLoginAt) : undefined,
  };
  return userProfile;
}


export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  console.log(`[TrekConnect Debug] MongoDB getUserProfile CALLED for ID: ${userId}`);
  if (!ObjectId.isValid(userId)) {
    console.error(`[TrekConnect Debug] getUserProfile: Invalid MongoDB ObjectId format for userId: ${userId}`);
    return null;
  }
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>('users');
    
    const userDoc = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!userDoc) {
      console.log(`[TrekConnect Debug] MongoDB getUserProfile: User not found for ID: ${userId}`);
      return null;
    }
    console.log(`[TrekConnect Debug] MongoDB getUserProfile: User found for ID: ${userId}`);
    return mapDocToUserProfile(userDoc);
  } catch (error) {
    console.error(`[TrekConnect Debug] Error fetching user profile by ID (${userId}):`, error);
    return null;
  }
}


export async function updateUserProfile(
  userId: string,
  dataToUpdate: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt' | 'lastLoginAt' | 'password'>>
): Promise<UserProfile | null> {
  console.log(`[TrekConnect Debug] MongoDB updateUserProfile CALLED for ID: ${userId}`);
  if (!userId) {
    console.error('[TrekConnect Debug] updateUserProfile FAILED: User ID is undefined or null.');
    return null;
  }
  if (!ObjectId.isValid(userId)) {
    console.error(`[TrekConnect Debug] updateUserProfile: Invalid MongoDB ObjectId format for userId: ${userId}`);
    return null;
  }

  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>('users');

    const updatePayload: Partial<UserDocument> & { $set?: any, $unset?: any } = { updatedAt: new Date() };
    
    // Explicitly use $set for defined values and $unset for undefined values if you want to remove fields
    // For simplicity, this version just sets fields. If a field in dataToUpdate is undefined, it means "don't change it".
    // If you want to explicitly set a field to null in DB, pass null.
    
    if (dataToUpdate.name !== undefined) updatePayload.name = dataToUpdate.name;
    if (dataToUpdate.photoUrl !== undefined) updatePayload.photoUrl = dataToUpdate.photoUrl; // Can be null to clear
    if (dataToUpdate.bio !== undefined) updatePayload.bio = dataToUpdate.bio; // Can be null
    if (dataToUpdate.age !== undefined) updatePayload.age = dataToUpdate.age; // Can be number or undefined (to not change)
    if (dataToUpdate.gender !== undefined) updatePayload.gender = dataToUpdate.gender;
    if (dataToUpdate.trekkingExperience !== undefined) updatePayload.trekkingExperience = dataToUpdate.trekkingExperience;
    if (dataToUpdate.languagesSpoken !== undefined) updatePayload.languagesSpoken = dataToUpdate.languagesSpoken;
    
    // Dot notation for nested objects
    if (dataToUpdate.travelPreferences) {
        if (dataToUpdate.travelPreferences.soloOrGroup !== undefined) updatePayload['travelPreferences.soloOrGroup'] = dataToUpdate.travelPreferences.soloOrGroup;
        if (dataToUpdate.travelPreferences.budget !== undefined) updatePayload['travelPreferences.budget'] = dataToUpdate.travelPreferences.budget;
        if (dataToUpdate.travelPreferences.style !== undefined) updatePayload['travelPreferences.style'] = dataToUpdate.travelPreferences.style;
    }
    
    if (dataToUpdate.wishlistDestinations !== undefined) updatePayload.wishlistDestinations = dataToUpdate.wishlistDestinations;
    if (dataToUpdate.travelHistory !== undefined) updatePayload.travelHistory = dataToUpdate.travelHistory;
    // plannedTrips and badges updates might need more specific logic like $addToSet, $pull for individual items.
    // This example assumes full replacement if the array is provided.
    if (dataToUpdate.plannedTrips !== undefined) updatePayload.plannedTrips = dataToUpdate.plannedTrips;
    if (dataToUpdate.badges !== undefined) updatePayload.badges = dataToUpdate.badges;


    const filter = { _id: new ObjectId(userId) };
    
    console.log(`[TrekConnect Debug] MongoDB updateUserProfile - Filter:`, JSON.stringify(filter));
    console.log(`[TrekConnect Debug] MongoDB updateUserProfile - Update Payload ($set):`, JSON.stringify(updatePayload));
    
    const result = await usersCollection.findOneAndUpdate(
      filter,
      { $set: updatePayload }, // Only use $set to update fields, not replace entire doc unless intended
      { returnDocument: 'after', projection: { password: 0 } } // Exclude password from returned doc
    );

    console.log(`[TrekConnect Debug] MongoDB updateUserProfile - findOneAndUpdateResult for ${userId}:`, result ? 'Document found and updated' : 'Document NOT found or not updated');

    if (!result) {
      console.error(`[TrekConnect Debug] FAILED to update profile or find user in DB for ID: ${userId}`);
      return null;
    }
    return mapDocToUserProfile(result as UserDocument); // Cast because result might be Document | null

  } catch (error) {
    console.error(`[TrekConnect Debug] CATCH BLOCK: Error updating user profile for ID (${userId}):`, error);
    return null;
  }
}

export async function getOtherUsers(currentUserId: string): Promise<UserProfile[]> {
  console.log(`[TrekConnect Debug] MongoDB getOtherUsers CALLED, excluding ID: ${currentUserId}`);
  if (!ObjectId.isValid(currentUserId)) {
    console.error(`[TrekConnect Debug] getOtherUsers: Invalid MongoDB ObjectId format for currentUserId: ${currentUserId}`);
    return [];
  }
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>('users');

    const filter = { _id: { $ne: new ObjectId(currentUserId) } };

    const userDocs = await usersCollection.find(filter).project({ password: 0 }).toArray(); 
    
    console.log(`[TrekConnect Debug] MongoDB getOtherUsers: Found ${userDocs.length} other users.`);
    return userDocs.map(doc => mapDocToUserProfile(doc as WithId<UserDocument>)); // Ensure proper casting for map
  } catch (error) {
    console.error('[TrekConnect Debug] Error fetching other users:', error);
    return [];
  }
}
