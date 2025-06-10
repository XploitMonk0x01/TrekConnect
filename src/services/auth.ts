
// 'use server' // This directive might not be needed if client-side Firebase is gone.

// Removed Firebase imports: auth, User as FirebaseUser
// Removed MongoDB imports: getDb, ObjectId
// Removed UserProfile type import as it's defined elsewhere or its Firebase-specific parts are gone.

// The functions syncUserWithMongoDB and getUserByFirebaseId were specific to
// synchronizing Firebase authenticated users with MongoDB.
// Since Firebase Authentication is removed, these functions are no longer applicable
// in their current form.

// You will need new service functions to:
// 1. Handle user creation in MongoDB during custom registration.
// 2. Fetch user profiles from MongoDB based on MongoDB _id (retrieved from your custom JWT).

// Example (placeholder for fetching user by MongoDB ID for custom auth):
/*
import type { UserProfile } from '@/lib/types'; // Assuming UserProfile is updated
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function getUserByIdFromMongoDB(userId: string): Promise<UserProfile | null> {
  try {
    const db = await getDb();
    const usersCollection = db.collection('users');
    
    if (!ObjectId.isValid(userId)) {
      console.warn('Invalid MongoDB ObjectId format for user:', userId);
      return null;
    }
    const userDoc = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!userDoc) return null;

    // Remap userDoc to UserProfile type
    // Ensure UserProfile type doesn't have firebaseUid anymore
    return {
      id: userDoc._id.toString(),
      name: userDoc.name || null,
      email: userDoc.email || null,
      photoUrl: userDoc.photoUrl || null,
      // ... other fields from your UserProfile type
      // Make sure to adjust the mapping based on your UserProfile definition in lib/types.ts
      age: userDoc.age,
      gender: userDoc.gender,
      bio: userDoc.bio,
      travelPreferences: userDoc.travelPreferences || {},
      languagesSpoken: userDoc.languagesSpoken || [],
      trekkingExperience: userDoc.trekkingExperience,
      wishlistDestinations: userDoc.wishlistDestinations || [],
      travelHistory: userDoc.travelHistory || [],
      plannedTrips: userDoc.plannedTrips || [],
      badges: userDoc.badges || [],
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching user by MongoDB ID:', error);
    throw error;
  }
}
*/
