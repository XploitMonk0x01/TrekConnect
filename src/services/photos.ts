import {
  ref as dbRef,
  set,
  get,
  push,
  query,
  orderByChild,
  equalTo,
  update,
} from 'firebase/database'
import { realtimeDb } from '@/lib/firebase'
import type { Photo, CreatePhotoInput } from '@/lib/types'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'

const PHOTOS_PATH = 'photos'

// Server-side function for creating photos
export async function createPhoto(
  photoInput: CreatePhotoInput
): Promise<Photo> {
  try {
    const photosRef = dbRef(realtimeDb, 'photos')
    const newPhotoRef = push(photosRef)
    const newPhotoId = newPhotoRef.key

    if (!newPhotoId) {
      throw new Error('Could not generate a new photo ID.')
    }

    const newPhoto: Photo = {
      id: newPhotoId,
      userId: photoInput.userId,
      userName: photoInput.userName,
      userAvatarUrl: photoInput.userAvatarUrl || null,
      imageUrl: photoInput.imageUrl || PLACEHOLDER_IMAGE_URL(600, 400),
      destinationName: photoInput.destinationName || '',
      caption: photoInput.caption || '',
      tags: photoInput.tags || [],
      uploadedAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      likes: [],
    }

    // Note: destinationId is not included as it's not part of the CreatePhotoInput
    // and is only used for potential linking to destination records

    await set(newPhotoRef, newPhoto)
    return newPhoto
  } catch (error) {
    console.error('Error creating photo in Firebase:', error)
    throw new Error('Failed to create photo.')
  }
}

export async function getAllPhotos(): Promise<Photo[]> {
  try {
    const photosRef = dbRef(realtimeDb, 'photos')
    const snapshot = await get(query(photosRef, orderByChild('uploadedAt')))

    if (snapshot.exists()) {
      const photosData = snapshot.val()
      // Firebase returns an object, convert it to an array and sort descending
      return Object.values<Photo>(photosData).sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
    }
    return []
  } catch (error) {
    console.error('Error getting all photos from Firebase:', error)
    return []
  }
}

// Get paginated photos
export async function getPaginatedPhotos(
  limit: number = 12,
  lastUploadedAt?: string
): Promise<{ photos: Photo[]; hasMore: boolean }> {
  try {
    const photosRef = dbRef(realtimeDb, PHOTOS_PATH)
    const snapshot = await get(query(photosRef, orderByChild('uploadedAt')))

    if (snapshot.exists()) {
      const photosData = snapshot.val()
      let allPhotos = Object.values<Photo>(photosData).sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )

      // If we have a cursor, filter photos older than the cursor
      if (lastUploadedAt) {
        const cursorTime = new Date(lastUploadedAt).getTime()
        allPhotos = allPhotos.filter(
          (p) => new Date(p.uploadedAt).getTime() < cursorTime
        )
      }

      // Get one extra to check if there are more
      const photos = allPhotos.slice(0, limit)
      const hasMore = allPhotos.length > limit

      return { photos, hasMore }
    }
    return { photos: [], hasMore: false }
  } catch (error) {
    console.error('Error getting paginated photos from Firebase:', error)
    return { photos: [], hasMore: false }
  }
}

export async function getPhotosByUser(userId: string): Promise<Photo[]> {
  try {
    const photosRef = dbRef(realtimeDb, 'photos')
    const userPhotosQuery = query(
      photosRef,
      orderByChild('userId'),
      equalTo(userId)
    )
    const snapshot = await get(userPhotosQuery)

    if (snapshot.exists()) {
      const photosData = snapshot.val()
      return Object.values<Photo>(photosData).sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
    }
    return []
  } catch (error) {
    console.error(
      `Error getting photos for user ${userId} from Firebase:`,
      error
    )
    return []
  }
}

// Toggle like on a photo
export async function togglePhotoLike(
  photoId: string,
  userId: string
): Promise<{ likesCount: number; likes: string[]; isLiked: boolean } | null> {
  try {
    const photoRef = dbRef(realtimeDb, `${PHOTOS_PATH}/${photoId}`)
    const snapshot = await get(photoRef)

    if (!snapshot.exists()) {
      return null
    }

    const photo = snapshot.val() as Photo
    const currentLikes = photo.likes || []
    const isCurrentlyLiked = currentLikes.includes(userId)

    let newLikes: string[]
    if (isCurrentlyLiked) {
      newLikes = currentLikes.filter((id) => id !== userId)
    } else {
      newLikes = [...currentLikes, userId]
    }

    const newLikesCount = newLikes.length

    await update(photoRef, {
      likes: newLikes,
      likesCount: newLikesCount,
    })

    return {
      likesCount: newLikesCount,
      likes: newLikes,
      isLiked: !isCurrentlyLiked,
    }
  } catch (error) {
    console.error(`Error toggling like on photo ${photoId}:`, error)
    throw new Error('Failed to toggle photo like.')
  }
}
