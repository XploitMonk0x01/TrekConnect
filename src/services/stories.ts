
'use server';

import type { Db, WithId, Document } from 'mongodb';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import type { Story, CreateStoryInput, UserProfile } from '@/lib/types';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

// Helper function to map MongoDB document to Story type
function mapDocToStory(doc: WithId<Document>): Story {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    userName: doc.userName || 'Anonymous Author',
    userAvatarUrl: doc.userAvatarUrl || null,
    title: doc.title || 'Untitled Story',
    content: doc.content || 'No content.',
    imageUrl: doc.imageUrl || null,
    destinationId: doc.destinationId,
    destinationName: doc.destinationName,
    tags: doc.tags || [],
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    likesCount: doc.likesCount || 0,
    commentsCount: doc.commentsCount || 0,
  };
}

export async function getAllStories(): Promise<Story[]> {
  try {
    const db: Db = await getDb();
    const storiesCollection = db.collection<WithId<Document>>('stories');
    const storyDocs = await storiesCollection.find({}).sort({ createdAt: -1 }).toArray();

    if (!storyDocs) {
      return [];
    }
    return storyDocs.map(mapDocToStory);
  } catch (error) {
    console.error('Error fetching stories from MongoDB:', error);
    return [];
  }
}

export async function getStoryById(id: string): Promise<Story | null> {
  try {
    const db: Db = await getDb();
    const storiesCollection = db.collection('stories');

    if (!ObjectId.isValid(id)) {
      console.warn(`Invalid ID format for getStoryById: ${id}`);
      return null;
    }

    const storyDoc = await storiesCollection.findOne({ _id: new ObjectId(id) });

    if (!storyDoc) {
      return null;
    }
    return mapDocToStory(storyDoc);
  } catch (error) {
    console.error(`Error fetching story by ID (${id}) from MongoDB:`, error);
    return null;
  }
}

export async function createStory(
  storyInput: CreateStoryInput,
  user: Pick<UserProfile, 'id' | 'name' | 'photoUrl'>
): Promise<Story | null> {
  try {
    const db: Db = await getDb();
    const storiesCollection = db.collection('stories');

    const now = new Date();
    const newStoryDocument: Omit<Story, 'id'> = {
      ...storyInput,
      userId: user.id,
      userName: user.name || 'Anonymous Author',
      userAvatarUrl: user.photoUrl || null,
      tags: storyInput.tags || [],
      imageUrl: storyInput.imageUrl || null,
      likesCount: 0,
      commentsCount: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const result = await storiesCollection.insertOne(newStoryDocument);

    if (result.insertedId) {
      const insertedDoc = await storiesCollection.findOne({ _id: result.insertedId });
      return insertedDoc ? mapDocToStory(insertedDoc) : null;
    }
    return null;
  } catch (error) {
    console.error('Error creating story in MongoDB:', error);
    return null;
  }
}
