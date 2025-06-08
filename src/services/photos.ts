
'use server';

import type { Db, WithId, Document } from 'mongodb';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import type { Photo, CreatePhotoInput, UserProfile } from '@/lib/types';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

// Helper function to map MongoDB document to Photo type
function mapDocToPhoto(doc: WithId<Document>): Photo {
  return {
    id: doc._id.toString(),
    userId: doc.userId || 'unknown_user',
    userName: doc.userName || 'Anonymous User',
    userAvatarUrl: doc.userAvatarUrl || null,
    imageUrl: doc.imageUrl || PLACEHOLDER_IMAGE_URL(600, 600),
    destinationId: doc.destinationId,
    destinationName: doc.destinationName,
    caption: doc.caption,
    tags: doc.tags || [],
    uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : new Date().toISOString(),
    likesCount: doc.likesCount || 0,
    commentsCount: doc.commentsCount || 0,
  };
}

export async function getAllPhotos(): Promise<Photo[]> {
  try {
    const db: Db = await getDb();
    const photosCollection = db.collection<WithId<Document>>('photos');
    const photoDocs = await photosCollection.find({}).sort({ uploadedAt: -1 }).toArray();

    if (!photoDocs) {
      return [];
    }
    return photoDocs.map(mapDocToPhoto);
  } catch (error) {
    console.error('Error fetching photos from MongoDB:', error);
    return [];
  }
}

export async function createPhoto(
  photoInput: CreatePhotoInput,
  user: Pick<UserProfile, 'id' | 'name' | 'photoUrl'>
): Promise<Photo | null> {
  try {
    const db: Db = await getDb();
    const photosCollection = db.collection('photos');

    const now = new Date();
    const newPhotoDocument: Omit<Photo, 'id'> = {
      userId: user.id,
      userName: user.name || 'Anonymous User',
      userAvatarUrl: user.photoUrl || null,
      imageUrl: photoInput.imageUrl, // This will be the Data URI for now
      caption: photoInput.caption || '',
      destinationId: photoInput.destinationId || undefined,
      destinationName: photoInput.destinationName || undefined,
      tags: photoInput.tags || [],
      likesCount: 0,
      commentsCount: 0,
      uploadedAt: now.toISOString(),
    };

    const result = await photosCollection.insertOne(newPhotoDocument);

    if (result.insertedId) {
      const insertedDoc = await photosCollection.findOne({ _id: result.insertedId });
      return insertedDoc ? mapDocToPhoto(insertedDoc) : null;
    }
    return null;
  } catch (error) {
    console.error('Error creating photo in MongoDB:', error);
    // Check if error is due to document size limit if using Data URIs extensively
    if (error instanceof Error && error.message.includes('document size')) {
        console.error("MongoDB document size limit likely exceeded. Consider using a dedicated file storage service instead of Data URIs for images.");
    }
    return null;
  }
}
