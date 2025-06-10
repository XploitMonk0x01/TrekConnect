'use server'

import type { Db, WithId, Document } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import type { Photo, CreatePhotoInput, UserProfile } from '@/lib/types'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'

// Define MongoDB document structure
interface PhotoDocument {
  _id: string
  userId: string
  firebaseUid: string
  userName: string
  userAvatarUrl?: string | null
  imageUrl: string
  destinationId?: string
  destinationName?: string
  caption?: string
  tags?: string[]
  uploadedAt: Date
  likesCount: number
  commentsCount: number
  likes: string[]
}

// Helper function to map MongoDB document to Photo type with user info
function mapDocToPhoto(doc: WithId<PhotoDocument>, user?: UserProfile): Photo {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    firebaseUid: doc.firebaseUid,
    userName: user?.name || doc.userName || 'Anonymous User',
    userAvatarUrl:
      user?.photoUrl || doc.userAvatarUrl || PLACEHOLDER_IMAGE_URL(40, 40),
    imageUrl: doc.imageUrl || PLACEHOLDER_IMAGE_URL(600, 600),
    destinationId: doc.destinationId,
    destinationName: doc.destinationName,
    caption: doc.caption,
    tags: doc.tags || [],
    uploadedAt: doc.uploadedAt
      ? new Date(doc.uploadedAt).toISOString()
      : new Date().toISOString(),
    likesCount: doc.likesCount || 0,
    commentsCount: doc.commentsCount || 0,
    likes: doc.likes || [],
  }
}

export async function createPhoto(
  photo: Partial<Photo>,
  user: UserProfile
): Promise<Photo> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<PhotoDocument>('photos')

    const newPhoto: Omit<PhotoDocument, '_id'> = {
      userId: user.id,
      firebaseUid: user.firebaseUid,
      userName: user.name || 'Anonymous User',
      userAvatarUrl: user.photoUrl,
      imageUrl: photo.imageUrl || PLACEHOLDER_IMAGE_URL(600, 600),
      destinationId: photo.destinationId,
      destinationName: photo.destinationName,
      caption: photo.caption,
      tags: photo.tags || [],
      uploadedAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      likes: [],
    }

    const result = await collection.insertOne(newPhoto as PhotoDocument)
    return mapDocToPhoto(
      { ...newPhoto, _id: result.insertedId.toString() },
      user
    )
  } catch (error) {
    console.error('Error creating photo:', error)
    throw error
  }
}

export async function getAllPhotos(): Promise<Photo[]> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<PhotoDocument>('photos')
    const photos = await collection.find().toArray()
    return photos.map((photo) => mapDocToPhoto(photo))
  } catch (error) {
    console.error('Error getting photos:', error)
    throw error
  }
}

export async function getPhotosByUser(userId: string): Promise<Photo[]> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<PhotoDocument>('photos')
    const photos = await collection
      .find({ userId })
      .sort({ uploadedAt: -1 })
      .toArray()
    return photos.map((photo) => mapDocToPhoto(photo))
  } catch (error) {
    console.error('Error getting user photos:', error)
    throw error
  }
}

export async function likePhoto(
  photoId: string,
  userId: string
): Promise<void> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<PhotoDocument>('photos')
    await collection.updateOne(
      { _id: photoId },
      {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 },
      }
    )
  } catch (error) {
    console.error('Error liking photo:', error)
    throw error
  }
}

export async function unlikePhoto(
  photoId: string,
  userId: string
): Promise<void> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<PhotoDocument>('photos')
    await collection.updateOne(
      { _id: photoId },
      {
        $pull: { likes: userId },
        $inc: { likesCount: -1 },
      }
    )
  } catch (error) {
    console.error('Error unliking photo:', error)
    throw error
  }
}
