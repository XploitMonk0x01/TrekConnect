'use server'

// Authentication service functions for custom MongoDB-based authentication
// This service handles user management operations for the TrekConnect application

// Example function for fetching user by MongoDB ID (for custom auth):
/*
import type { UserProfile } from '@/lib/types';
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

    // Map userDoc to UserProfile type
    return {
      id: userDoc._id.toString(),
      name: userDoc.name || null,
      email: userDoc.email || null,
      photoUrl: userDoc.photoUrl || null,
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
