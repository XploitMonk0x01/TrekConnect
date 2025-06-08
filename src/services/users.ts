
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
    photoUrl: doc.photoUrl === undefined ? null : doc.photoUrl, 
    age: doc.age,
    gender: doc.gender,
    bio: doc.bio === undefined ? null : doc.bio, 
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

    const existingUserDoc = await usersCollection.findOne({ _id: firebaseUser.uid });
    if (existingUserDoc) {
        console.log(`[TrekConnect Debug] DIAGNOSTIC: User ${firebaseUser.uid} ALREADY EXISTS in MongoDB. Document:`, JSON.stringify(existingUserDoc));
    } else {
        console.log(`[TrekConnect Debug] DIAGNOSTIC: User ${firebaseUser.uid} DOES NOT EXIST in MongoDB. Will be inserted.`);
    }

    const updateData: Partial<Omit<UserProfile, 'id' | 'createdAt'>> = {
      name: firebaseUser.displayName || null,
      email: firebaseUser.email || null,
      photoUrl: firebaseUser.photoURL || null, 
      updatedAt: now,
    };

    const insertData: Omit<UserProfile, 'id'> = {
      name: firebaseUser.displayName || null,
      email: firebaseUser.email || null,
      photoUrl: firebaseUser.photoURL || null, 
      age: undefined,
      gender: undefined,
      bio: null, 
      travelPreferences: {
        soloOrGroup: undefined,
        budget: undefined,
        style: '', 
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
        console.error(`[TrekConnect Debug] CRITICAL: findOneAndUpdate returned a falsy value (e.g. null) for UID ${firebaseUser.uid} during upsert. This means the document was not created or updated as expected.`);
        return null;
    }
    
    const upsertedDoc = result as WithId<Document> | null; 
    if (!upsertedDoc) {
         console.error(`[TrekConnect Debug] CRITICAL: Document from findOneAndUpdate result is null/undefined for UID ${firebaseUser.uid} even though result object was truthy. This is unexpected. Raw result:`, JSON.stringify(result));
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
  if (!uid) {
    console.error("[TrekConnect Debug] updateUserProfile PRE-CHECK FAILED: UID is undefined or null.");
    return null;
  }
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');

    console.log(`[TrekConnect Debug] PRE-UPDATE CHECK: Attempting to find user document with UID: "${uid}"`);
    const existingDocBeforeUpdate = await usersCollection.findOne({ _id: uid });
    if (!existingDocBeforeUpdate) {
      console.error(`[TrekConnect Debug] PRE-UPDATE CHECK FAILED: User document with UID "${uid}" not found in MongoDB. Cannot update.`);
      return null;
    }
    console.log(`[TrekConnect Debug] PRE-UPDATE CHECK SUCCESS: User document with UID "${uid}" found. Document:`, JSON.stringify(existingDocBeforeUpdate));


    const updatePayload: { [key: string]: any } = {};
    for (const key in dataToUpdate) {
        const typedKey = key as keyof typeof dataToUpdate;
        if (dataToUpdate[typedKey] !== undefined) { 
            updatePayload[typedKey] = dataToUpdate[typedKey];
        }
    }
    updatePayload.updatedAt = new Date();

    console.log(`[TrekConnect Debug] Attempting to update profile for UID: "${uid}".`);
    console.log(`[TrekConnect Debug] Filter: { _id: "${uid}" }`);
    console.log(`[TrekConnect Debug] Update Payload ($set):`, JSON.stringify(updatePayload, null, 2));

    const findOneAndUpdateResult = await usersCollection.findOneAndUpdate(
      { _id: uid }, 
      { $set: updatePayload },
      { returnDocument: 'after' } 
    );
    
    console.log(`[TrekConnect Debug] RAW findOneAndUpdateResult for UID "${uid}" (updateUserProfile):`, JSON.stringify(findOneAndUpdateResult, null, 2));

    if (findOneAndUpdateResult) { 
      const updatedDoc = findOneAndUpdateResult as WithId<Document> | null; 
       if (updatedDoc) {
        console.log(`[TrekConnect Debug] Successfully updated profile for UID: "${uid}". Returned Document:`, JSON.stringify(updatedDoc));
        return mapDocToUserProfile(updatedDoc);
      } else {
        console.warn(`[TrekConnect Debug] User profile update for UID: "${uid}" (findOneAndUpdate) did not return a document as expected, though the result object was truthy. This could indicate an issue with the operation or an unexpected response structure. Result:`, findOneAndUpdateResult);
        return null;
      }
    } else {
      console.warn(`[TrekConnect Debug] No user profile found or updated for UID: "${uid}" during update attempt (findOneAndUpdate returned null or undefined). Document may not exist, filter did not match, or no fields were actually changed.`);
      // If no fields were changed, findOneAndUpdate might return the original document if returnDocument is 'before' or null if 'after' and no change.
      // However, we always update `updatedAt`, so a change should always occur.
      return null;
    }

  } catch (error) {
    console.error(`[TrekConnect Debug] CATCH BLOCK: Error updating user profile for UID ("${uid}") in MongoDB:`, error);
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
    

    
