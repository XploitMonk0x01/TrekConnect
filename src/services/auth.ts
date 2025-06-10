'use server'

import { auth } from '@/lib/firebase'
import { getDb } from '@/lib/mongodb'
import type { User as FirebaseUser } from 'firebase/auth'
import { ObjectId } from 'mongodb'
import type { UserProfile } from '@/lib/types'

export async function syncUserWithMongoDB(
  firebaseUser: FirebaseUser
): Promise<UserProfile> {
  try {
    const db = await getDb()
    const usersCollection = db.collection('users')

    // Check if user already exists (check both _id and firebaseUid for backward compatibility)
    const existingUser = await usersCollection.findOne({
      $or: [
        { _id: new ObjectId(firebaseUser.uid) },
        { firebaseUid: firebaseUser.uid },
      ],
    })

    if (existingUser) {
      // Update existing user
      const updatedUser = {
        ...existingUser,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoUrl: firebaseUser.photoURL,
        lastLoginAt: new Date(),
        // If the document was found by firebaseUid, ensure _id matches
        _id: new ObjectId(firebaseUser.uid),
      }

      await usersCollection.updateOne(
        {
          $or: [
            { _id: new ObjectId(firebaseUser.uid) },
            { firebaseUid: firebaseUser.uid },
          ],
        },
        {
          $set: updatedUser,
          $unset: { firebaseUid: '' }, // Remove the separate firebaseUid field
        }
      )

      return {
        id: firebaseUser.uid,
        firebaseUid: firebaseUser.uid,
        name: firebaseUser.displayName || null,
        email: firebaseUser.email || null,
        photoUrl: firebaseUser.photoURL || null,
        bio: existingUser.bio || null,
        age: existingUser.age || null,
        gender: existingUser.gender || null,
        travelPreferences: existingUser.travelPreferences || {},
        languagesSpoken: existingUser.languagesSpoken || [],
        trekkingExperience: existingUser.trekkingExperience || null,
        wishlistDestinations: existingUser.wishlistDestinations || [],
        travelHistory: existingUser.travelHistory || [],
        plannedTrips: existingUser.plannedTrips || [],
        badges: existingUser.badges || [],
        createdAt: existingUser.createdAt,
        updatedAt: new Date(),
      }
    }

    // Create new user with Firebase UID as _id
    const newUser = {
      _id: new ObjectId(firebaseUser.uid), // Use Firebase UID as MongoDB _id
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      photoUrl: firebaseUser.photoURL,
      bio: undefined,
      age: undefined,
      gender: undefined,
      travelPreferences: {},
      languagesSpoken: [],
      trekkingExperience: undefined,
      wishlistDestinations: [],
      travelHistory: [],
      plannedTrips: [],
      badges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await usersCollection.insertOne(newUser)

    return {
      id: firebaseUser.uid,
      firebaseUid: firebaseUser.uid,
      ...newUser,
    }
  } catch (error) {
    console.error('Error syncing user with MongoDB:', error)
    throw error
  }
}

// Get user by Firebase UID
export async function getUserByFirebaseId(
  firebaseUid: string
): Promise<UserProfile | null> {
  try {
    const db = await getDb()
    const user = await db.collection('users').findOne({ firebaseUid })

    if (!user) return null

    return {
      id: user._id.toString(),
      firebaseUid: user.firebaseUid,
      name: user.name || null,
      email: user.email || null,
      photoUrl: user.photoUrl || null,
      bio: user.bio || null,
      age: user.age || null,
      gender: user.gender || null,
      travelPreferences: user.travelPreferences || {},
      languagesSpoken: user.languagesSpoken || [],
      trekkingExperience: user.trekkingExperience || null,
      wishlistDestinations: user.wishlistDestinations || [],
      travelHistory: user.travelHistory || [],
      plannedTrips: user.plannedTrips || [],
      badges: user.badges || [],
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}
