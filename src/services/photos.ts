
'use server';

import { ref, set, get, push, query, orderByChild, equalTo } from 'firebase/database';
import { realtimeDb } from '@/lib/firebase';
import type { Photo, CreatePhotoInput } from '@/lib/types';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

const PHOTOS_PATH = 'photos';

export async function createPhoto(photoInput: CreatePhotoInput): Promise<Photo> {
  try {
    const photosRef = ref(realtimeDb, PHOTOS_PATH);
    const newPhotoRef = push(photosRef);
    const newPhotoId = newPhotoRef.key;

    if (!newPhotoId) {
      throw new Error('Could not generate a new photo ID.');
    }

    const newPhoto: Photo = {
      id: newPhotoId,
      userId: photoInput.userId,
      userName: photoInput.userName,
      userAvatarUrl: photoInput.userAvatarUrl || null,
      imageUrl: photoInput.imageUrl || PLACEHOLDER_IMAGE_URL(600, 600),
      destinationId: photoInput.destinationId,
      destinationName: photoInput.destinationName,
      caption: photoInput.caption,
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
    const photosRef = ref(realtimeDb, PHOTOS_PATH);
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
    const photosRef = ref(realtimeDb, PHOTOS_PATH);
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
