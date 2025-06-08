
'use server';

import type { User as FirebaseUser } from 'firebase/auth';
import type { Db, WithId, Document } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import type { UserProfile } from '@/lib/types';

// Helper function to map MongoDB document to UserProfile type
function mapDocToUserProfile(doc: WithId<Document>): UserProfile {
  const userProfile: UserProfile = {
    id: doc._id.toString(), // In this service, we'll use firebaseUid as _id for simplicity
    name: doc.name || null,
    email: doc.email || null,
    photoUrl: doc.photoUrl || null,
    age: doc.age,
    gender: doc.gender,
    bio: doc.bio,
    travelPreferences: doc.travelPreferences || {},
    languagesSpoken: doc.languagesSpoken || [],
    trekkingExperience: doc.trekkingExperience,
    wishlistDestinations: doc.wishlistDestinations || [],
    travelHistory: doc.travelHistory || [],
    plannedTrips: doc.plannedTrips || [],
    badges: doc.badges || [],
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  };
  return userProfile;
}


export async function upsertUserFromFirebase(firebaseUser: FirebaseUser): Promise<UserProfile | null> {
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');

    const now = new Date();

    const userProfileData: Partial<UserProfile> = {
      name: firebaseUser.displayName,
      email: firebaseUser.email,
      photoUrl: firebaseUser.photoURL,
      updatedAt: now,
    };

    // Fields to set on insert (create)
    constsetOnInsertData: Partial<UserProfile> = {
      age: undefined,
      gender: undefined,
      bio: '',
      travelPreferences: {
        soloOrGroup: undefined,
        budget: undefined,
        style: undefined,
      },
      languagesSpoken: [],
      trekkingExperience: undefined,
      wishlistDestinations: [],
      travelHistory: [],
      plannedTrips: [],
      badges: [],
      createdAt: now,
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: firebaseUser.uid }, // Use Firebase UID as the document _id
      { 
        $set: userProfileData,
        $setOnInsert: setOnInsertData
      },
      { 
        upsert: true, // Create the document if it doesn't exist
        returnDocument: 'after' // Return the updated or new document
      }
    );

    if (result) {
        // The 'value' property is deprecated, check result directly if using mongodb driver v4+
        // For v5+ (which we likely are using with Next.js latest), the result itself is the document or null.
        const updatedDoc = result as WithId<Document> | null; // Type assertion
        return updatedDoc ? mapDocToUserProfile(updatedDoc) : null;
    }
    return null;

  } catch (error) {
    console.error('Error upserting user in MongoDB:', error);
    // Optionally, re-throw the error or handle it as per your app's error strategy
    // For now, returning null to indicate failure
    return null;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');
    const userDoc = await usersCollection.findOne({ _id: uid }); // UID is stored as _id

    if (!userDoc) {
      return null;
    }
    return mapDocToUserProfile(userDoc);
  } catch (error) {
    console.error(`Error fetching user profile for UID (${uid}) from MongoDB:`, error);
    return null;
  }
}

export async function updateUserProfile(uid: string, dataToUpdate: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>): Promise<UserProfile | null> {
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');

    const updateData = {
      ...dataToUpdate,
      updatedAt: new Date(),
    };

    const result = await usersCollection.findOneAndUpdate(
      { _id: uid },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (result) {
        const updatedDoc = result as WithId<Document> | null;
        return updatedDoc ? mapDocToUserProfile(updatedDoc) : null;
    }
    return null;

  } catch (error) {
    console.error(`Error updating user profile for UID (${uid}) in MongoDB:`, error);
    return null;
  }
}
