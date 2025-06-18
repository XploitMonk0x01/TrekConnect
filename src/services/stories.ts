'use server'

import type { Db, WithId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import type { Story, CreateStoryInput, UserProfile } from '@/lib/types'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { ObjectId } from 'mongodb'

// Define MongoDB document structure for Story
interface StoryDocument {
  _id: ObjectId // Use ObjectId for new stories
  userId: string // MongoDB user _id of the author
  userName: string
  userAvatarUrl?: string | null
  title: string
  content: string
  imageUrl?: string | null
  destinationId?: string
  destinationName?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  likesCount: number
  commentsCount: number
  likes: string[] // Array of user _ids who liked
}

// Helper function to map MongoDB document to Story type
function mapDocToStory(doc: WithId<StoryDocument>): Story {
  // UserProfile arg removed
  return {
    id: doc._id.toString(),
    userId: doc.userId, // This is the MongoDB _id of the user
    userName: doc.userName || 'Anonymous User',
    userAvatarUrl: doc.userAvatarUrl || PLACEHOLDER_IMAGE_URL(40, 40),
    title: doc.title,
    content: doc.content,
    imageUrl: doc.imageUrl,
    destinationId: doc.destinationId,
    destinationName: doc.destinationName,
    tags: doc.tags || [],
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: doc.updatedAt
      ? new Date(doc.updatedAt).toISOString()
      : new Date().toISOString(),
    likesCount: doc.likesCount || 0,
    commentsCount: doc.commentsCount || 0,
    likes: doc.likes || [],
  }
}

// CreateStoryInput already includes userId, userName, userAvatarUrl from lib/types.ts
export async function createStory(
  storyInput: CreateStoryInput
): Promise<Story> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<Omit<StoryDocument, '_id'>>('stories') // Use Omit for insertion

    const newStoryDocumentData: Omit<StoryDocument, '_id'> = {
      userId: storyInput.userId, // MongoDB _id of the user
      userName: storyInput.userName,
      userAvatarUrl: storyInput.userAvatarUrl,
      title: storyInput.title || 'Untitled Story',
      content: storyInput.content || '',
      imageUrl: storyInput.imageUrl,
      destinationId: storyInput.destinationId,
      destinationName: storyInput.destinationName,
      tags: storyInput.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      likes: [],
    }

    const result = await collection.insertOne(newStoryDocumentData)
    const insertedDoc: WithId<StoryDocument> = {
      ...newStoryDocumentData,
      _id: result.insertedId,
    }
    return mapDocToStory(insertedDoc)
  } catch (error) {
    console.error('Error creating story:', error)
    throw error
  }
}

export async function getAllStories(): Promise<Story[]> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')
    const storyDocs = await collection.find().sort({ createdAt: -1 }).toArray()
    return storyDocs.map(mapDocToStory)
  } catch (error) {
    console.error('Error getting all stories:', error)
    return []
  }
}

export async function getStoryById(storyId: string): Promise<Story | null> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')
    if (!ObjectId.isValid(storyId)) {
      console.warn(`Invalid story ID format: ${storyId}`)
      return null
    }
    const storyDoc = await collection.findOne({ _id: new ObjectId(storyId) })
    if (!storyDoc) return null
    return mapDocToStory(storyDoc)
  } catch (error) {
    console.error(`Error fetching story by ID (${storyId}):`, error)
    return null
  }
}

export async function getStoriesByUser(userId: string): Promise<Story[]> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')
    // Assuming userId is the string representation of MongoDB _id
    const storyDocs = await collection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray()
    return storyDocs.map(mapDocToStory)
  } catch (error) {
    console.error(`Error getting stories for user ${userId}:`, error)
    return []
  }
}

// UserProfile for author in updates for authorization checks
export async function updateStory(
  storyId: string,
  updates: Partial<Story>,
  authorId: string
): Promise<Story | null> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')

    if (!ObjectId.isValid(storyId)) return null

    const existingStory = await collection.findOne({
      _id: new ObjectId(storyId),
    })
    if (!existingStory || existingStory.userId !== authorId) {
      throw new Error('Story not found or user not authorized to update.')
    }

    const { id, userId, userName, userAvatarUrl, createdAt, ...restUpdates } =
      updates // Exclude fields not directly updatable this way
    const updateData: Partial<
      Omit<
        StoryDocument,
        '_id' | 'userId' | 'userName' | 'userAvatarUrl' | 'createdAt'
      >
    > = {
      ...restUpdates,
      updatedAt: new Date(),
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(storyId), userId: authorId },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) return null
    return mapDocToStory(result as StoryDocument)
  } catch (error) {
    console.error(`Error updating story ${storyId}:`, error)
    throw error
  }
}

export async function likeStory(
  storyId: string,
  likingUserId: string
): Promise<void> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')
    await collection.updateOne(
      { _id: new ObjectId(storyId) },
      {
        $addToSet: { likes: likingUserId }, // Add MongoDB _id of liking user
        $inc: { likesCount: 1 },
      }
    )
  } catch (error) {
    console.error(
      `Error liking story ${storyId} by user ${likingUserId}:`,
      error
    )
    throw error
  }
}

export async function unlikeStory(
  storyId: string,
  unlikingUserId: string
): Promise<void> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')
    await collection.updateOne(
      { _id: new ObjectId(storyId) },
      {
        $pull: { likes: unlikingUserId }, // Remove MongoDB _id of unliking user
        $inc: { likesCount: -1 },
      }
    )
  } catch (error) {
    console.error(
      `Error unliking story ${storyId} by user ${unlikingUserId}:`,
      error
    )
    throw error
  }
}

export async function deleteStory(
  storyId: string,
  authorId: string
): Promise<void> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')
    if (!ObjectId.isValid(storyId)) {
      throw new Error('Invalid story ID format for deletion.')
    }
    const result = await collection.deleteOne({
      _id: new ObjectId(storyId),
      userId: authorId,
    })
    if (result.deletedCount === 0) {
      throw new Error('Story not found or user not authorized to delete.')
    }
  } catch (error) {
    console.error(`Error deleting story ${storyId}:`, error)
    throw error
  }
}
