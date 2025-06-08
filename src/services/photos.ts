
'use server';

import type { Db, WithId, Document } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import type { Photo } from '@/lib/types';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

// Helper function to map MongoDB document to Photo type
function mapDocToPhoto(doc: WithId<Document>): Photo {
  return {
    id: doc._id.toString(),
    userId: doc.userId || 'unknown_user',
    userName: doc.userName || 'Anonymous User',
    userAvatarUrl: doc.userAvatarUrl || PLACEHOLDER_IMAGE_URL(40, 40),
    imageUrl: doc.imageUrl || PLACEHOLDER_IMAGE_URL(600, 600),
    destinationId: doc.destinationId,
    destinationName: doc.destinationName,
    caption: doc.caption,
    uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : new Date().toISOString(),
    likesCount: doc.likesCount || 0,
    commentsCount: doc.commentsCount || 0,
  };
}

export async function getAllPhotos(): Promise<Photo[]> {
  try {
    const db: Db = await getDb();
    const photosCollection = db.collection<WithId<Document>>('photos');
    // Sort by upload date, newest first
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
