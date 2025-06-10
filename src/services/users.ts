
'use server'

// Removed FirebaseUser import
import type { UserProfile } from '@/lib/types'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';


// Define the structure of our MongoDB document
interface UserDocument {
  _id: ObjectId; // MongoDB ObjectId for new users, or existing string FirebaseUIDs for old ones
  name: string | null;
  email: string | null;
  photoUrl: string | null;
  bio: string | null;
  age: number | null | undefined;
  gender: string | null | undefined;
  travelPreferences: {
    soloOrGroup?: string | null;
    budget?: string | null;
    style?: string | null;
  };
  languagesSpoken: string[];
  trekkingExperience:
    | 'Beginner'
    | 'Intermediate'
    | 'Advanced'
    | 'Expert'
    | null
    | undefined;
  wishlistDestinations: string[]; // Store destination IDs or names
  travelHistory: string[]; // Store destination IDs or names
  plannedTrips: any[]; // Define PlannedTrip interface if not done
  badges: any[]; // Define Badge interface if not done
  createdAt: Date;
  updatedAt: Date;
  // firebaseUid field is removed
  password?: string; // For custom auth, password hash will be stored here
  lastLoginAt?: Date;
}

// Helper function to map MongoDB document to UserProfile type
function mapDocToUserProfile(doc: UserDocument): UserProfile {
  const userProfile: UserProfile = {
    id: doc._id.toString(),
    name: doc.name || null,
    email: doc.email || null,
    photoUrl: doc.photoUrl === undefined ? null : (doc.photoUrl || null), // Ensure null if empty
    age: doc.age ?? undefined,
    gender: doc.gender ?? undefined,
    bio: doc.bio ?? null, // Ensure null if empty
    trekkingExperience: doc.trekkingExperience ?? undefined,
    travelPreferences: {
      soloOrGroup: doc.travelPreferences?.soloOrGroup === null ? undefined : doc.travelPreferences?.soloOrGroup as UserProfile['travelPreferences']['soloOrGroup'],
      budget: doc.travelPreferences?.budget === null ? undefined : doc.travelPreferences?.budget as UserProfile['travelPreferences']['budget'],
      style: doc.travelPreferences?.style === null ? undefined : doc.travelPreferences?.style,
    },
    languagesSpoken: doc.languagesSpoken || [],
    // Ensure wishlistDestinations and travelHistory are arrays of strings or appropriate objects
    wishlistDestinations: (doc.wishlistDestinations || []).map(d => typeof d === 'string' ? d : (d as any).id || (d as any).name || ''),
    travelHistory: (doc.travelHistory || []).map(h => typeof h === 'string' ? h : (h as any).id || (h as any).name || ''),
    plannedTrips: (doc.plannedTrips || []).map((trip: any) => ({
      id: trip.id || trip._id?.toString() || '',
      destinationId: trip.destinationId || '',
      destinationName: trip.destinationName || '',
      startDate: trip.startDate ? String(trip.startDate) : '',
      endDate: trip.endDate ? String(trip.endDate) : '',
    })),
    badges: (doc.badges || []).map((badge: any) => ({ // Assuming badges are stored as simple strings or need a proper type
      id: typeof badge === 'string' ? badge : badge.id || '',
      name: typeof badge === 'string' ? badge : badge.name || '',
      description: typeof badge === 'string' ? '' : badge.description || '',
    })),
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
    lastLoginAt: doc.lastLoginAt ? new Date(doc.lastLoginAt) : undefined,
  };
  return userProfile;
}

// Fetches user profile by MongoDB _id string
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  console.log(`[TrekConnect Debug] MongoDB getUserProfile CALLED for ID: ${userId}`);
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>('users');
    
    // Check if ID is a valid ObjectId, otherwise assume it might be an old FirebaseUID string
    let userDoc;
    if (ObjectId.isValid(userId)) {
      userDoc = await usersCollection.findOne({ _id: new ObjectId(userId) });
    } else {
      // This case handles users potentially migrated from Firebase where _id was a string UID
      // However, new users will have ObjectId. This might lead to inconsistencies if not handled carefully during migration.
      // For this removal, we assume 'userId' could be either.
      // A better approach for future is to have a dedicated migration script.
      // For now, if it's not an ObjectId, we try finding it as a string _id.
      // This might fail if all old _id were not ObjectIds.
      // The API route /api/users/[userId] should also handle this logic.
      userDoc = await usersCollection.findOne({ _id: userId as any }); // Cast to any if _id is strictly ObjectId in type
    }

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

// upsertUserFromFirebase function is removed as Firebase Auth is no longer used.
// New user creation will be handled by your custom /api/auth/signup route.

export async function updateUserProfile(
  userId: string,
  dataToUpdate: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt' | 'lastLoginAt'>>
): Promise<UserProfile | null> {
  console.log(`[TrekConnect Debug] MongoDB updateUserProfile CALLED for ID: ${userId}`);
  if (!userId) {
    console.error('[TrekConnect Debug] updateUserProfile FAILED: User ID is undefined or null.');
    return null;
  }

  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>('users');

    const updatePayload: Partial<UserDocument> = { updatedAt: new Date() };

    // Map UserProfile fields to UserDocument fields for update
    if (dataToUpdate.name !== undefined) updatePayload.name = dataToUpdate.name;
    if (dataToUpdate.photoUrl !== undefined) updatePayload.photoUrl = dataToUpdate.photoUrl;
    if (dataToUpdate.bio !== undefined) updatePayload.bio = dataToUpdate.bio;
    if (dataToUpdate.age !== undefined) updatePayload.age = dataToUpdate.age;
    if (dataToUpdate.gender !== undefined) updatePayload.gender = dataToUpdate.gender;
    if (dataToUpdate.trekkingExperience !== undefined) updatePayload.trekkingExperience = dataToUpdate.trekkingExperience;
    if (dataToUpdate.languagesSpoken !== undefined) updatePayload.languagesSpoken = dataToUpdate.languagesSpoken;
    
    if (dataToUpdate.travelPreferences) {
      updatePayload.travelPreferences = {}; // Initialize if not present
      if (dataToUpdate.travelPreferences.soloOrGroup !== undefined) updatePayload.travelPreferences.soloOrGroup = dataToUpdate.travelPreferences.soloOrGroup;
      if (dataToUpdate.travelPreferences.budget !== undefined) updatePayload.travelPreferences.budget = dataToUpdate.travelPreferences.budget;
      if (dataToUpdate.travelPreferences.style !== undefined) updatePayload.travelPreferences.style = dataToUpdate.travelPreferences.style;
    }
    // Note: wishlistDestinations, travelHistory, plannedTrips, badges updates might need more specific logic
    // (e.g., $addToSet, $pull) if you're not replacing the entire array.
    // For simplicity, this example assumes full replacement if provided.
    if (dataToUpdate.wishlistDestinations) updatePayload.wishlistDestinations = dataToUpdate.wishlistDestinations;
    if (dataToUpdate.travelHistory) updatePayload.travelHistory = dataToUpdate.travelHistory;
    // plannedTrips and badges might need specific handling if their structure is complex

    console.log(`[TrekConnect Debug] MongoDB updateUserProfile - Filter: { _id: ${userId} }`);
    console.log(`[TrekConnect Debug] MongoDB updateUserProfile - Update Payload ($set):`, JSON.stringify(updatePayload));

    let filter;
    if (ObjectId.isValid(userId)) {
        filter = { _id: new ObjectId(userId) };
    } else {
        // This handles old string UIDs. For new users, userId should be an ObjectId string.
        // This may not correctly find users if all _id are strictly ObjectIds.
        console.warn(`[TrekConnect Debug] updateUserProfile: userId ${userId} is not a valid ObjectId. Attempting as string _id.`);
        filter = { _id: userId as any };
    }
    
    const result = await usersCollection.findOneAndUpdate(
      filter,
      { $set: updatePayload },
      { returnDocument: 'after' }
    );

    console.log(`[TrekConnect Debug] MongoDB updateUserProfile - findOneAndUpdateResult for ${userId}:`, result ? 'Document found' : 'Document NOT found or not updated');

    if (!result) {
      console.error(`[TrekConnect Debug] FAILED to update profile or find user in DB for ID: ${userId}`);
      return null;
    }
    return mapDocToUserProfile(result as UserDocument);

  } catch (error) {
    console.error(`[TrekConnect Debug] CATCH BLOCK: Error updating user profile for ID (${userId}):`, error);
    return null;
  }
}

export async function getOtherUsers(currentUserId: string): Promise<UserProfile[]> {
  console.log(`[TrekConnect Debug] MongoDB getOtherUsers CALLED, excluding ID: ${currentUserId}`);
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>('users');

    let filter;
    if (ObjectId.isValid(currentUserId)) {
        filter = { _id: { $ne: new ObjectId(currentUserId) } };
    } else {
        filter = { _id: { $ne: currentUserId as any } };
    }

    const userDocs = await usersCollection.find(filter).project({ password: 0 }).toArray(); // Exclude password
    
    console.log(`[TrekConnect Debug] MongoDB getOtherUsers: Found ${userDocs.length} other users.`);
    return userDocs.map(mapDocToUserProfile);
  } catch (error) {
    console.error('[TrekConnect Debug] Error fetching other users:', error);
    return [];
  }
}
