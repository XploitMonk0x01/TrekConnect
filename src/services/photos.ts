
'use server'

import type { Db, WithId } from 'mongodb'; // Document removed
import { getDb } from '@/lib/mongodb';
import type { Photo, CreatePhotoInput, UserProfile } from '@/lib/types'; // UserProfile for creator info
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { ObjectId } from 'mongodb';

// Define MongoDB document structure for Photo
interface PhotoDocument {
  _id: ObjectId; // Use ObjectId for new photos
  userId: string; // MongoDB user _id of the uploader
  // firebaseUid removed
  userName: string;
  userAvatarUrl?: string | null;
  imageUrl: string;
  destinationId?: string;
  destinationName?: string;
  caption?: string;
  tags?: string[];
  uploadedAt: Date;
  likesCount: number;
  commentsCount: number;
  likes: string[]; // Array of user _ids who liked
}

// Helper function to map MongoDB document to Photo type
function mapDocToPhoto(doc: WithId<PhotoDocument>): Photo { // UserProfile arg removed, assume denormalized data
  return {
    id: doc._id.toString(),
    userId: doc.userId, // This is the MongoDB _id of the user
    userName: doc.userName || 'Anonymous User',
    userAvatarUrl: doc.userAvatarUrl || PLACEHOLDER_IMAGE_URL(40, 40),
    imageUrl: doc.imageUrl || PLACEHOLDER_IMAGE_URL(600, 600),
    destinationId: doc.destinationId,
    destinationName: doc.destinationName,
    caption: doc.caption,
    tags: doc.tags || [],
    uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : new Date().toISOString(),
    likesCount: doc.likesCount || 0,
    commentsCount: doc.commentsCount || 0,
    likes: doc.likes || [],
  };
}

// CreatePhotoInput already includes userId, userName, userAvatarUrl from lib/types.ts
export async function createPhoto(photoInput: CreatePhotoInput): Promise<Photo> {
  try {
    const db: Db = await getDb();
    const collection = db.collection<Omit<PhotoDocument, '_id'>>('photos'); // Use Omit for insertion

    const newPhotoDocumentData: Omit<PhotoDocument, '_id'> = {
      userId: photoInput.userId, // This is the MongoDB _id of the user
      userName: photoInput.userName,
      userAvatarUrl: photoInput.userAvatarUrl,
      imageUrl: photoInput.imageUrl || PLACEHOLDER_IMAGE_URL(600, 600),
      destinationId: photoInput.destinationId,
      destinationName: photoInput.destinationName,
      caption: photoInput.caption,
      tags: photoInput.tags || [],
      uploadedAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      likes: [],
    };

    const result = await collection.insertOne(newPhotoDocumentData);
    
    // Construct the full document for mapping, including the new _id
    const insertedDoc: WithId<PhotoDocument> = {
        ...newPhotoDocumentData,
        _id: result.insertedId,
    };
    return mapDocToPhoto(insertedDoc);
  } catch (error) {
    console.error('Error creating photo:', error);
    throw error; // Re-throw to be caught by the caller
  }
}

export async function getAllPhotos(): Promise<Photo[]> {
  try {
    const db: Db = await getDb();
    const collection = db.collection<PhotoDocument>('photos');
    const photoDocs = await collection.find().sort({ uploadedAt: -1 }).toArray();
    return photoDocs.map(mapDocToPhoto);
  } catch (error) {
    console.error('Error getting all photos:', error);
    return []; // Return empty array on error
  }
}

export async function getPhotosByUser(userId: string): Promise<Photo[]> {
  try {
    const db: Db = await getDb();
    const collection = db.collection<PhotoDocument>('photos');
    // Assuming userId is the string representation of MongoDB _id
    const photoDocs = await collection.find({ userId: userId }).sort({ uploadedAt: -1 }).toArray();
    return photoDocs.map(mapDocToPhoto);
  } catch (error) {
    console.error(`Error getting photos for user ${userId}:`, error);
    return [];
  }
}

export async function likePhoto(photoId: string, likingUserId: string): Promise<void> {
  try {
    const db: Db = await getDb();
    const collection = db.collection<PhotoDocument>('photos');
    await collection.updateOne(
      { _id: new ObjectId(photoId) },
      {
        $addToSet: { likes: likingUserId }, // Add MongoDB _id of liking user
        $inc: { likesCount: 1 },
      }
    );
  } catch (error) {
    console.error(`Error liking photo ${photoId} by user ${likingUserId}:`, error);
    throw error;
  }
}

export async function unlikePhoto(photoId: string, unlikingUserId: string): Promise<void> {
  try {
    const db: Db = await getDb();
    const collection = db.collection<PhotoDocument>('photos');
    await collection.updateOne(
      { _id: new ObjectId(photoId) },
      {
        $pull: { likes: unlikingUserId }, // Remove MongoDB _id of unliking user
        $inc: { likesCount: -1 },
      }
    );
  } catch (error) {
    console.error(`Error unliking photo ${photoId} by user ${unlikingUserId}:`, error);
    throw error;
  }
}
