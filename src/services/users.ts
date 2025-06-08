
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
  return userProfile;
}


export async function upsertUserFromFirebase(firebaseUser: FirebaseUser): Promise<UserProfile | null> {
  console.log(`[TrekConnect Debug] upsertUserFromFirebase CALLED for UID: ${firebaseUser.uid}, Email: ${firebaseUser.email}, Name: ${firebaseUser.displayName}, Photo: ${firebaseUser.photoURL}`);
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');
    const now = new Date();

    // --- Diagnostic: Check if user exists before upsert ---
    try {
      const existingUser = await usersCollection.findOne({ _id: firebaseUser.uid });
      if (existingUser) {
        console.log(`[TrekConnect Debug] DIAGNOSTIC: User ${firebaseUser.uid} ALREADY EXISTS in DB before upsert. Document:`, JSON.stringify(existingUser));
      } else {
        console.log(`[TrekConnect Debug] DIAGNOSTIC: User ${firebaseUser.uid} DOES NOT EXIST in DB before upsert.`);
      }
    } catch (findError) {
      console.error(`[TrekConnect Debug] DIAGNOSTIC: Error during pre-upsert findOne for ${firebaseUser.uid}:`, findError);
    }
    // --- End Diagnostic ---

    const userProfileDataToSet: Partial<Pick<UserProfile, 'name' | 'email' | 'photoUrl' | 'updatedAt'>> = {
        updatedAt: now,
    };
    if (firebaseUser.displayName !== undefined) userProfileDataToSet.name = firebaseUser.displayName; else userProfileDataToSet.name = null;
    if (firebaseUser.email !== undefined) userProfileDataToSet.email = firebaseUser.email; else userProfileDataToSet.email = null;
    if (firebaseUser.photoURL !== undefined) userProfileDataToSet.photoUrl = firebaseUser.photoURL; else userProfileDataToSet.photoUrl = null;


    const userProfileDataToSetOnInsert: Omit<UserProfile, 'id'> = {
      name: firebaseUser.displayName || null,
      email: firebaseUser.email || null,
      photoUrl: firebaseUser.photoURL || null,
      age: undefined,
      gender: undefined,
      bio: null,
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
      updatedAt: now,
    };
    
    const filteredSetData: { [key: string]: any } = {};
    for (const key in userProfileDataToSet) {
        const typedKey = key as keyof typeof userProfileDataToSet;
        // Allow null values to be set, but exclude undefined
        if (userProfileDataToSet[typedKey] !== undefined) {
            filteredSetData[typedKey] = userProfileDataToSet[typedKey];
        }
    }


    console.log(`[TrekConnect Debug] Upserting user ${firebaseUser.uid}.`);
    console.log(`[TrekConnect Debug] Filter: { _id: "${firebaseUser.uid}" }`);
    console.log(`[TrekConnect Debug] Data for $set:`, JSON.stringify(filteredSetData, null, 2));
    console.log(`[TrekConnect Debug] Data for $setOnInsert:`, JSON.stringify(userProfileDataToSetOnInsert, null, 2));

    const result = await usersCollection.findOneAndUpdate(
      { _id: firebaseUser.uid }, 
      { 
        $set: filteredSetData,
        $setOnInsert: userProfileDataToSetOnInsert
      },
      { 
        upsert: true, 
        returnDocument: 'after' 
      }
    );
    
    console.log(`[TrekConnect Debug] findOneAndUpdate result for ${firebaseUser.uid} (upsertUserFromFirebase):`, JSON.stringify(result, null, 2));

    if (result) { 
        const updatedDoc = result as WithId<Document> | null; 
        if (updatedDoc) {
            console.log(`[TrekConnect Debug] User ${firebaseUser.uid} successfully upserted/found. Returned Document:`, JSON.stringify(updatedDoc));
            return mapDocToUserProfile(updatedDoc);
        } else {
             // This case should ideally not be hit if result is truthy and returnDocument: 'after' is used.
             // It might indicate an issue with how MongoDB driver returns the document or an unexpected structure.
             console.error(`[TrekConnect Debug] CRITICAL: User ${firebaseUser.uid} upsert operation (findOneAndUpdate) returned a truthy value but the document itself was null or not in the expected structure. Result:`, JSON.stringify(result));
             // Attempting fallback fetch as a last resort, though this signals a deeper issue.
             const fallbackDoc = await usersCollection.findOne({ _id: firebaseUser.uid });
             if (fallbackDoc) {
                 console.log(`[TrekConnect Debug] Fallback fetch for ${firebaseUser.uid} successful after unexpected upsert result. Document:`, JSON.stringify(fallbackDoc));
                 return mapDocToUserProfile(fallbackDoc);
             } else {
                 console.error(`[TrekConnect Debug] CRITICAL: Fallback fetch for ${firebaseUser.uid} FAILED after upsert did not return document as expected.`);
                 return null;
             }
        }
    } else {
      // This means findOneAndUpdate returned null/undefined directly.
      console.error(`[TrekConnect Debug] CRITICAL: findOneAndUpdate for user ${firebaseUser.uid} returned null/undefined. Upsert failed to return a document. This usually means the document was not found and upsert did not insert, or an error occurred that wasn't thrown but prevented document return.`);
      // Attempting direct fetch as last resort.
      const finalAttemptDoc = await usersCollection.findOne({ _id: firebaseUser.uid });
      if (finalAttemptDoc) {
           console.warn(`[TrekConnect Debug] Last resort fetch for ${firebaseUser.uid} successful. Document found, but upsert did not return it. This points to an issue with the upsert operation or its configuration. Document:`, JSON.stringify(finalAttemptDoc));
           return mapDocToUserProfile(finalAttemptDoc);
      } else {
           console.error(`[TrekConnect Debug] CRITICAL: User ${firebaseUser.uid} still not found after all attempts during upsert. The user document was not created in MongoDB.`);
           return null;
      }
    }

  } catch (error) {
    console.error(`[TrekConnect Debug] CATCH BLOCK: Error in upsertUserFromFirebase for UID (${firebaseUser.uid}):`, error);
    return null;
  }
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

export async function updateUserProfile(uid: string, dataToUpdate: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>): Promise<UserProfile | null> {
  console.log(`[TrekConnect Debug] updateUserProfile CALLED for UID: ${uid}`);
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');

    const updatePayload: { [key: string]: any } = {};
    for (const key in dataToUpdate) {
        const typedKey = key as keyof typeof dataToUpdate;
        if (dataToUpdate[typedKey] !== undefined) { // Only include defined values, allows for null to be set.
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
    
