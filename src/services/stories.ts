'use server'

import type { Db, WithId, Document } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import type { Story, CreateStoryInput, UserProfile } from '@/lib/types'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'

// Define MongoDB document structure
interface StoryDocument {
  _id: string
  userId: string
  firebaseUid: string
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
  likes: string[]
}

// Helper function to map MongoDB document to Story type with user info
function mapDocToStory(doc: WithId<StoryDocument>, user?: UserProfile): Story {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    firebaseUid: doc.firebaseUid,
    userName: user?.name || doc.userName || 'Anonymous User',
    userAvatarUrl:
      user?.photoUrl || doc.userAvatarUrl || PLACEHOLDER_IMAGE_URL(40, 40),
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

export async function createStory(
  story: Partial<Story>,
  user: UserProfile
): Promise<Story> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')

    const newStory: Omit<StoryDocument, '_id'> = {
      userId: user.id,
      firebaseUid: user.firebaseUid,
      userName: user.name || 'Anonymous User',
      userAvatarUrl: user.photoUrl,
      title: story.title || '',
      content: story.content || '',
      imageUrl: story.imageUrl,
      destinationId: story.destinationId,
      destinationName: story.destinationName,
      tags: story.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
      likes: [],
    }

    const result = await collection.insertOne(newStory as StoryDocument)
    return mapDocToStory(
      { ...newStory, _id: result.insertedId.toString() },
      user
    )
  } catch (error) {
    console.error('Error creating story:', error)
    throw error
  }
}

export async function getAllStories(): Promise<Story[]> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')
    const stories = await collection.find().sort({ createdAt: -1 }).toArray()
    return stories.map((story) => mapDocToStory(story))
  } catch (error) {
    console.error('Error getting stories:', error)
    throw error
  }
}

export async function getStoriesByUser(userId: string): Promise<Story[]> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')
    const stories = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()
    return stories.map((story) => mapDocToStory(story))
  } catch (error) {
    console.error('Error getting user stories:', error)
    throw error
  }
}

export async function updateStory(
  storyId: string,
  updates: Partial<Story>,
  user: UserProfile
): Promise<Story> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')
    const story = await collection.findOne({
      _id: storyId,
      userId: user.id,
    })

    if (!story) {
      throw new Error('Story not found or user not authorized')
    }

    // Remove 'id' and ensure 'createdAt' is a Date if present
    const { id, createdAt, ...restUpdates } = updates
    const updatedStory: Partial<StoryDocument> = {
      ...restUpdates,
      ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
      updatedAt: new Date(),
    }

    await collection.updateOne({ _id: storyId }, { $set: updatedStory })

    const updated = await collection.findOne({ _id: storyId })
    return mapDocToStory(updated!, user)
  } catch (error) {
    console.error('Error updating story:', error)
    throw error
  }
}

export async function likeStory(
  storyId: string,
  userId: string
): Promise<void> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')
    await collection.updateOne(
      { _id: storyId },
      {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 },
      }
    )
  } catch (error) {
    console.error('Error liking story:', error)
    throw error
  }
}

export async function unlikeStory(
  storyId: string,
  userId: string
): Promise<void> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')
    await collection.updateOne(
      { _id: storyId },
      {
        $pull: { likes: userId },
        $inc: { likesCount: -1 },
      }
    )
  } catch (error) {
    console.error('Error unliking story:', error)
    throw error
  }
}

export async function deleteStory(
  storyId: string,
  user: UserProfile
): Promise<void> {
  try {
    const db: Db = await getDb()
    const collection = db.collection<StoryDocument>('stories')
    const result = await collection.deleteOne({
      _id: storyId,
      userId: user.id,
    })

    if (result.deletedCount === 0) {
      throw new Error('Story not found or user not authorized')
    }
  } catch (error) {
    console.error('Error deleting story:', error)
    throw error
  }
}
