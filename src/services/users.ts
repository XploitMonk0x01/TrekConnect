
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
    photoUrl: doc.photoUrl === undefined ? null : doc.photoUrl, // Ensure photoUrl can be null
    age: doc.age,
    gender: doc.gender,
    bio: doc.bio === undefined ? null : doc.bio, // Ensure bio can be null
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

    // Fields to always update or set from Firebase profile if they exist
    const userProfileDataToSet: Partial<UserProfile> = {
        updatedAt: now,
    };
    if (firebaseUser.displayName !== null) userProfileDataToSet.name = firebaseUser.displayName;
    if (firebaseUser.email !== null) userProfileDataToSet.email = firebaseUser.email;
    if (firebaseUser.photoURL !== null) userProfileDataToSet.photoUrl = firebaseUser.photoURL;


    // Fields to set only on insert (create) - comprehensive defaults
    // Ensure these fields match UserProfile structure, initializing all as undefined or default empty values
    const userProfileDataToSetOnInsert: Omit<UserProfile, 'id'> = {
      name: firebaseUser.displayName || null,
      email: firebaseUser.email || null,
      photoUrl: firebaseUser.photoURL || null,
      age: undefined,
      gender: undefined,
      bio: null, // Initialize as null
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
      updatedAt: now, // Also set updatedAt on insert
    };
    
    const filteredSetData: any = {};
    for (const key in userProfileDataToSet) {
        if (userProfileDataToSet[key as keyof typeof userProfileDataToSet] !== undefined) {
            filteredSetData[key] = userProfileDataToSet[key as keyof typeof userProfileDataToSet];
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
             console.warn(`[TrekConnect Debug] User ${firebaseUser.uid} upsert operation did not return a document (result was truthy but not a doc). Attempting fallback fetch.`);
             const fallbackDoc = await usersCollection.findOne({ _id: firebaseUser.uid });
             if (fallbackDoc) {
                 console.log(`[TrekConnect Debug] Fallback fetch for ${firebaseUser.uid} successful. Document:`, JSON.stringify(fallbackDoc));
                 return mapDocToUserProfile(fallbackDoc);
             } else {
                 console.error(`[TrekConnect Debug] CRITICAL: Fallback fetch for ${firebaseUser.uid} FAILED after upsert did not return document.`);
                 return null;
             }
        }
    } else {
      console.error(`[TrekConnect Debug] CRITICAL: findOneAndUpdate for user ${firebaseUser.uid} returned null/undefined. Upsert might have failed. Attempting direct fetch as last resort.`);
      const finalAttemptDoc = await usersCollection.findOne({ _id: firebaseUser.uid });
      if (finalAttemptDoc) {
           console.log(`[TrekConnect Debug] Last resort fetch for ${firebaseUser.uid} successful. Document:`, JSON.stringify(finalAttemptDoc));
           return mapDocToUserProfile(finalAttemptDoc);
      } else {
           console.error(`[TrekConnect Debug] CRITICAL: User ${firebaseUser.uid} still not found after all attempts during upsert.`);
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
        // Only include keys that are not undefined. Allow null values to be set.
        if (dataToUpdate[typedKey] !== undefined) {
            updatePayload[typedKey] = dataToUpdate[typedKey];
        }
    }
    updatePayload.updatedAt = new Date();

    // If travelPreferences is in payload and is an empty object {}, remove it or MongoDB might store it as {}
    if (updatePayload.travelPreferences && typeof updatePayload.travelPreferences === 'object' && Object.keys(updatePayload.travelPreferences).length === 0) {
      // If all sub-fields are undefined, travelPreferences itself would be undefined from edit page,
      // so this check is more of a safeguard if an empty object somehow gets passed.
      // It's better to explicitly $unset it if you want to remove it, or ensure schema handles {}
      // For now, if it's an empty object and we want to remove it, we could do:
      // delete updatePayload.travelPreferences; // This would prevent setting it as {}
      // Or, if the intent is to clear it, use $unset:
      // await usersCollection.updateOne({ _id: uid }, { $unset: { travelPreferences: "" }});
      // For simplicity, let's assume an empty object is fine for now if it reaches here,
      // but ideally, the frontend should not send an empty object if it means "no preference".
    }


    console.log(`[TrekConnect Debug] Attempting to update profile for UID: ${uid}.`);
    console.log(`[TrekConnect Debug] Filter: { _id: "${uid}" }`);
    console.log(`[TrekConnect Debug] Update Payload ($set):`, JSON.stringify(updatePayload, null, 2));

    const findOneAndUpdateResult = await usersCollection.findOneAndUpdate(
      { _id: uid }, 
      { $set: updatePayload },
      { returnDocument: 'after' } 
    );
    
    // Log the raw result directly from MongoDB
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
    
