
'use server';

import { ref as dbRef, set, get, push, query, orderByChild, equalTo } from 'firebase/database';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import { realtimeDb, storage } from '@/lib/firebase';
import type { Photo, CreatePhotoInput } from '@/lib/types';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';


// Helper function to upload image and get URL
async function uploadImageAndGetURL(dataUri: string, userId: string): Promise<string> {
    if (!dataUri.startsWith('data:image')) {
        // If it's not a data URI, assume it's already a URL or a placeholder
        return dataUri;
    }
    const imageRef = storageRef(storage, `images/${userId}/${uuidv4()}`);
    const snapshot = await uploadString(imageRef, dataUri, 'data_url');
    return getDownloadURL(snapshot.ref);
}

export async function createPhoto(photoInput: CreatePhotoInput): Promise<Photo> {
  try {
    const photosRef = dbRef(realtimeDb, 'photos');
    const newPhotoRef = push(photosRef);
    const newPhotoId = newPhotoRef.key;

    if (!newPhotoId) {
      throw new Error('Could not generate a new photo ID.');
    }
    
    const finalImageUrl = photoInput.imageUrl 
      ? await uploadImageAndGetURL(photoInput.imageUrl, photoInput.userId) 
      : PLACEHOLDER_IMAGE_URL(600, 600);

    const newPhoto: Photo = {
      id: newPhotoId,
      userId: photoInput.userId,
      userName: photoInput.userName,
      userAvatarUrl: photoInput.userAvatarUrl || null,
      imageUrl: finalImageUrl,
      destinationId: photoInput.destinationId || undefined,
      destinationName: photoInput.destinationName || '', // Use empty string for consistency
      caption: photoInput.caption || '', // Use empty string for consistency
      tags: photoInput.tags || [],
      uploadedAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      likes: [],
    };

    await set(newPhotoRef, newPhoto);
    return newPhoto;
  } catch (error) {
    console.error('Error creating photo in Firebase:', error);
    throw new Error('Failed to create photo.');
  }
}

export async function getAllPhotos(): Promise<Photo[]> {
  try {
    const photosRef = dbRef(realtimeDb, 'photos');
    const snapshot = await get(query(photosRef, orderByChild('uploadedAt')));
    
    if (snapshot.exists()) {
      const photosData = snapshot.val();
      // Firebase returns an object, convert it to an array and sort descending
      return Object.values<Photo>(photosData).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }
    return [];
  } catch (error) {
    console.error('Error getting all photos from Firebase:', error);
    return [];
  }
}

export async function getPhotosByUser(userId: string): Promise<Photo[]> {
  try {
    const photosRef = dbRef(realtimeDb, 'photos');
    const userPhotosQuery = query(photosRef, orderByChild('userId'), equalTo(userId));
    const snapshot = await get(userPhotosQuery);

    if (snapshot.exists()) {
      const photosData = snapshot.val();
      return Object.values<Photo>(photosData).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }
    return [];
  } catch (error) {
    console.error(`Error getting photos for user ${userId} from Firebase:`, error);
    return [];
  }
}
