
'use server';

import type { User as FirebaseUser } from 'firebase/auth';
import type { Db, WithId, Document } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import type { UserProfile } from '@/lib/types';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

// Helper function to map MongoDB document to UserProfile type
function mapDocToUserProfile(doc: WithId<Document>): UserProfile {
  console.log(`[TrekConnect Debug] mapDocToUserProfile CALLED. Input doc:`, JSON.stringify(doc));
  const userProfile: UserProfile = {
    id: doc._id.toString(), 
    name: doc.name || null,
    email: doc.email || null,
    photoUrl: doc.photoUrl === undefined ? null : doc.photoUrl, // Preserve null if it's explicitly null
    age: doc.age,
    gender: doc.gender,
    bio: doc.bio === undefined ? null : doc.bio, // Preserve null
    travelPreferences: doc.travelPreferences || { soloOrGroup: undefined, budget: undefined, style: undefined },
    languagesSpoken: doc.languagesSpoken || [],
    trekkingExperience: doc.trekkingExperience,
    wishlistDestinations: doc.wishlistDestinations || [],
    travelHistory: doc.travelHistory || [],
    plannedTrips: doc.plannedTrips || [],
    badges: doc.badges || [],
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  };
  console.log(`[TrekConnect Debug] Mapped UserProfile:`, JSON.stringify(userProfile));
  return userProfile;
}


export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  console.log(`[TrekConnect Debug] getUserProfile CALLED for UID: ${uid}`);
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');
    const userDoc = await usersCollection.findOne({ _id: uid }); 

    if (!userDoc) {
      console.warn(`[TrekConnect Debug] No user profile found in DB for UID: ${uid}`);
      return null;
    }
    console.log(`[TrekConnect Debug] User profile found for UID: ${uid}. Document:`, JSON.stringify(userDoc));
    return mapDocToUserProfile(userDoc);
  } catch (error) {
    console.error(`[TrekConnect Debug] CATCH BLOCK: Error fetching user profile for UID (${uid}) from MongoDB:`, error);
    return null;
  }
}

export async function upsertUserFromFirebase(firebaseUser: FirebaseUser): Promise<UserProfile | null> {
  console.log(`[TrekConnect Debug] upsertUserFromFirebase CALLED for UID: ${firebaseUser.uid}, Email: ${firebaseUser.email}, Name: ${firebaseUser.displayName}, Photo: ${firebaseUser.photoURL}`);
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');
    const now = new Date();

    // DIAGNOSTIC: Check if user already exists
    const existingUser = await usersCollection.findOne({ _id: firebaseUser.uid });
    if (existingUser) {
        console.log(`[TrekConnect Debug] DIAGNOSTIC: User ${firebaseUser.uid} ALREADY EXISTS in MongoDB. Document:`, JSON.stringify(existingUser));
    } else {
        console.log(`[TrekConnect Debug] DIAGNOSTIC: User ${firebaseUser.uid} DOES NOT EXIST in MongoDB. Will be inserted.`);
    }

    const updateData: Partial<Omit<UserProfile, 'id' | 'createdAt'>> = {
      name: firebaseUser.displayName || null,
      email: firebaseUser.email || null,
      photoUrl: firebaseUser.photoURL || null, // Set to null if firebaseUser.photoURL is empty/null
      updatedAt: now,
    };

    const insertData: Omit<UserProfile, 'id'> = {
      name: firebaseUser.displayName || null,
      email: firebaseUser.email || null,
      photoUrl: firebaseUser.photoURL || null, // Set to null if firebaseUser.photoURL is empty/null
      age: undefined,
      gender: undefined,
      bio: null,
      travelPreferences: {
        soloOrGroup: undefined,
        budget: undefined,
        style: '', // Default to empty string for style
      },
      languagesSpoken: [],
      trekkingExperience: undefined,
      wishlistDestinations: [],
      travelHistory: [],
      plannedTrips: [],
      badges: [],
      createdAt: now,
      updatedAt: now,
    };
    
    console.log(`[TrekConnect Debug] Upserting user ${firebaseUser.uid}. Filter: { _id: "${firebaseUser.uid}" }`);
    console.log(`[TrekConnect Debug] $set data:`, JSON.stringify(updateData, null, 2));
    console.log(`[TrekConnect Debug] $setOnInsert data:`, JSON.stringify(insertData, null, 2));

    const result = await usersCollection.findOneAndUpdate(
      { _id: firebaseUser.uid },
      {
        $set: updateData,
        $setOnInsert: insertData,
      },
      { upsert: true, returnDocument: 'after' }
    );

    console.log(`[TrekConnect Debug] findOneAndUpdate result for ${firebaseUser.uid} (upsertUserFromFirebase):`, JSON.stringify(result, null, 2));
    
    if (!result) {
        console.error(`[TrekConnect Debug] CRITICAL: findOneAndUpdate returned null/undefined for UID ${firebaseUser.uid} during upsert. This means the document was not created or updated as expected.`);
        return null;
    }
    // The result from findOneAndUpdate when returnDocument: 'after' is used and an upsert occurs or a document is found
    // should be the document itself.
    const upsertedDoc = result as WithId<Document> | null;
    if (!upsertedDoc) {
         console.error(`[TrekConnect Debug] CRITICAL: Document from findOneAndUpdate result is null/undefined for UID ${firebaseUser.uid} even though result object was truthy. This is unexpected.`);
        return null;
    }

    console.log(`[TrekConnect Debug] User ${firebaseUser.uid} successfully upserted/found. Document:`, JSON.stringify(upsertedDoc));
    return mapDocToUserProfile(upsertedDoc);

  } catch (error) {
    console.error(`[TrekConnect Debug] CATCH BLOCK: Error in upsertUserFromFirebase for UID (${firebaseUser.uid}):`, error);
    return null;
  }
}

export async function updateUserProfile(uid: string, dataToUpdate: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>): Promise<UserProfile | null> {
  console.log(`[TrekConnect Debug] updateUserProfile CALLED for UID: ${uid}`);
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');

    const updatePayload: { [key: string]: any } = {};
    // Ensure only valid, non-undefined fields are included. photoUrl and bio can be explicitly null.
    for (const key in dataToUpdate) {
        const typedKey = key as keyof typeof dataToUpdate;
        if (dataToUpdate[typedKey] !== undefined) { 
            updatePayload[typedKey] = dataToUpdate[typedKey];
        }
    }
    updatePayload.updatedAt = new Date();

    console.log(`[TrekConnect Debug] Attempting to update profile for UID: ${uid}.`);
    console.log(`[TrekConnect Debug] Filter: { _id: "${uid}" }`);
    console.log(`[TrekConnect Debug] Update Payload ($set):`, JSON.stringify(updatePayload, null, 2));

    const findOneAndUpdateResult = await usersCollection.findOneAndUpdate(
      { _id: uid }, 
      { $set: updatePayload },
      { returnDocument: 'after' } 
    );
    
    console.log(`[TrekConnect Debug] RAW findOneAndUpdateResult for ${uid} (updateUserProfile):`, JSON.stringify(findOneAndUpdateResult, null, 2));

    if (findOneAndUpdateResult) { 
      const updatedDoc = findOneAndUpdateResult as WithId<Document> | null; 
       if (updatedDoc) {
        console.log(`[TrekConnect Debug] Successfully updated profile for UID: ${uid}. Returned Document:`, JSON.stringify(updatedDoc));
        return mapDocToUserProfile(updatedDoc);
      } else {
        console.warn(`[TrekConnect Debug] User profile update for UID: ${uid} (findOneAndUpdate) did not return a document as expected, though the result was truthy. This could indicate an issue with the operation or an unexpected response structure. Result:`, findOneAndUpdateResult);
        return null;
      }
    } else {
      console.warn(`[TrekConnect Debug] No user profile found for UID: ${uid} during update attempt (findOneAndUpdate returned null or undefined). Document may not exist or filter did not match.`);
      return null;
    }

  } catch (error) {
    console.error(`[TrekConnect Debug] CATCH BLOCK: Error updating user profile for UID (${uid}) in MongoDB:`, error);
    return null;
  }
}

export async function getOtherUsers(currentUserId: string): Promise<UserProfile[]> {
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');
    const userDocs = await usersCollection.find({ _id: { $ne: currentUserId } }).toArray();

    if (!userDocs || userDocs.length === 0) {
      console.log(`[TrekConnect Debug] No other users found besides ${currentUserId}.`);
      return [];
    }
    console.log(`[TrekConnect Debug] Found ${userDocs.length} other users.`);
    return userDocs.map(doc => mapDocToUserProfile(doc as WithId<Document>));
  } catch (error)
 {
    console.error('[TrekConnect Debug] CATCH BLOCK: Error fetching other users from MongoDB:', error);
    return [];
  }
}
    

    