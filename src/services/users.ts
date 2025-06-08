
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
  console.log(`[TrekConnect Debug] upsertUserFromFirebase called for UID: ${firebaseUser.uid}, Email: ${firebaseUser.email}`);
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');

    const now = new Date();

    const userProfileData: Partial<UserProfile> = { // Fields to always update or set
      name: firebaseUser.displayName,
      email: firebaseUser.email,
      photoUrl: firebaseUser.photoURL,
      updatedAt: now,
    };

    // Fields to set only on insert (create)
    const setOnInsertData: Partial<UserProfile> = {
      age: undefined,
      gender: undefined,
      bio: '',
      travelPreferences: { // Ensure the object exists with undefined properties
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
    };
    
    console.log(`[TrekConnect Debug] Upserting user ${firebaseUser.uid}. Data for $set:`, JSON.stringify(userProfileData));
    console.log(`[TrekConnect Debug] Upserting user ${firebaseUser.uid}. Data for $setOnInsert:`, JSON.stringify(setOnInsertData));

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
        const updatedDoc = result as WithId<Document> | null; // MongoDB v5 driver returns the document directly
        if (updatedDoc) {
            console.log(`[TrekConnect Debug] User ${firebaseUser.uid} successfully upserted/found. Document:`, JSON.stringify(updatedDoc));
            return mapDocToUserProfile(updatedDoc);
        } else {
            console.warn(`[TrekConnect Debug] User ${firebaseUser.uid} upsert operation did not return a document, though it should have with returnDocument: 'after'.`);
            // Attempt to fetch the document directly as a fallback check
            const fetchedDoc = await usersCollection.findOne({ _id: firebaseUser.uid });
            if (fetchedDoc) {
                 console.log(`[TrekConnect Debug] User ${firebaseUser.uid} found via direct fetch after upsert warning.`);
                 return mapDocToUserProfile(fetchedDoc);
            } else {
                 console.error(`[TrekConnect Debug] User ${firebaseUser.uid} still not found after upsert warning and direct fetch. This is unexpected.`);
                 return null;
            }
        }
    } else {
        // This case should ideally not be hit if upsert is true and returnDocument is 'after'
        // unless there was a more fundamental DB error caught by the catch block.
        console.warn(`[TrekConnect Debug] findOneAndUpdate for user ${firebaseUser.uid} returned null/undefined result object. This is highly unusual with upsert:true.`);
        // As a last resort, try fetching. This indicates a problem if we reach here.
        const fetchedDoc = await usersCollection.findOne({ _id: firebaseUser.uid });
        if (fetchedDoc) {
             console.log(`[TrekConnect Debug] User ${firebaseUser.uid} found via direct fetch after unexpected null/undefined upsert result.`);
             return mapDocToUserProfile(fetchedDoc);
        } else {
             console.error(`[TrekConnect Debug] User ${firebaseUser.uid} not found even after direct fetch following unexpected null/undefined upsert result.`);
             return null;
        }
    }

  } catch (error) {
    console.error(`[TrekConnect Debug] Error in upsertUserFromFirebase for UID (${firebaseUser.uid}):`, error);
    return null;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  console.log(`[TrekConnect Debug] getUserProfile called for UID: ${uid}`);
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');
    const userDoc = await usersCollection.findOne({ _id: uid }); // UID is stored as _id

    if (!userDoc) {
      console.warn(`[TrekConnect Debug] No user profile found in DB for UID: ${uid}`);
      return null;
    }
    console.log(`[TrekConnect Debug] User profile found for UID: ${uid}. Document:`, JSON.stringify(userDoc));
    return mapDocToUserProfile(userDoc);
  } catch (error) {
    console.error(`[TrekConnect Debug] Error fetching user profile for UID (${uid}) from MongoDB:`, error);
    return null;
  }
}

export async function updateUserProfile(uid: string, dataToUpdate: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>): Promise<UserProfile | null> {
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');

    // Remove any fields from dataToUpdate that are undefined, as $set with undefined can sometimes be problematic
    // or simply not update if you intend to unset a field (for which $unset would be used).
    // For this case, we only want to set defined values.
    const updatePayload: any = {};
    for (const key in dataToUpdate) {
        if (dataToUpdate[key as keyof typeof dataToUpdate] !== undefined) {
            updatePayload[key] = dataToUpdate[key as keyof typeof dataToUpdate];
        }
    }
    updatePayload.updatedAt = new Date();


    console.log(`[TrekConnect Debug] Attempting to update profile for UID: ${uid} with data:`, JSON.stringify(updatePayload, null, 2));

    const findOneAndUpdateResult = await usersCollection.findOneAndUpdate(
      { _id: uid },
      { $set: updatePayload },
      { returnDocument: 'after' }
    );
    
    if (findOneAndUpdateResult) {
      // MongoDB v5 driver returns the document directly in findOneAndUpdateResult
      const updatedDoc = findOneAndUpdateResult as WithId<Document> | null;
       if (updatedDoc) {
        console.log(`[TrekConnect Debug] Successfully updated profile for UID: ${uid}. Document:`, JSON.stringify(updatedDoc));
        return mapDocToUserProfile(updatedDoc);
      } else {
        // This condition (findOneAndUpdateResult is truthy but updatedDoc is falsy) should not occur with MongoDB v5+
        // if the operation was successful and found a document.
        // It implies the document was found, but the update somehow resulted in a null return for the document itself.
        console.warn(`[TrekConnect Debug] User profile update for UID: ${uid} seemed to succeed but returned no document. This is unexpected.`);
        return null;
      }
    } else {
      // This means the document with _id: uid was not found.
      console.warn(`[TrekConnect Debug] No user profile found for UID: ${uid} during update attempt. Document may not exist or filter did not match.`);
      return null;
    }

  } catch (error) {
    console.error(`[TrekConnect Debug] Error updating user profile for UID (${uid}) in MongoDB:`, error);
    return null;
  }
}

export async function getOtherUsers(currentUserId: string): Promise<UserProfile[]> {
  try {
    const db: Db = await getDb();
    const usersCollection = db.collection('users');
    const userDocs = await usersCollection.find({ _id: { $ne: currentUserId } }).toArray();

    if (!userDocs) {
      return [];
    }
    return userDocs.map(doc => mapDocToUserProfile(doc as WithId<Document>));
  } catch (error) {
    console.error('Error fetching other users from MongoDB:', error);
    return [];
  }
}

    