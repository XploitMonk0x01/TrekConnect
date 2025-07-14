
'use server'

import { ref, set, get, push, query, orderByChild, equalTo } from 'firebase/database';
import { realtimeDb } from '@/lib/firebase';
import type { Story, CreateStoryInput } from '@/lib/types';


const STORIES_PATH = 'stories';

export async function createStory(storyInput: CreateStoryInput): Promise<Story> {
  try {
    const storiesRef = ref(realtimeDb, STORIES_PATH);
    const newStoryRef = push(storiesRef);
    const newStoryId = newStoryRef.key;

    if (!newStoryId) {
      throw new Error('Could not generate a new story ID.');
    }

    const newStory: Story = {
      id: newStoryId,
      userId: storyInput.userId,
      userName: storyInput.userName,
      userAvatarUrl: storyInput.userAvatarUrl || null,
      title: storyInput.title,
      content: storyInput.content,
      imageUrl: storyInput.imageUrl || null, // Ensure null if undefined/empty
      destinationName: storyInput.destinationName || '', // Use empty string for consistency
      tags: storyInput.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      likes: [],
    };

    await set(newStoryRef, newStory);
    return newStory;
  } catch (error) {
    console.error('Error creating story in Firebase:', error);
    throw new Error('Failed to create story.');
  }
}

export async function getAllStories(): Promise<Story[]> {
  try {
    const storiesRef = ref(realtimeDb, STORIES_PATH);
    const snapshot = await get(query(storiesRef, orderByChild('createdAt')));
    
    if (snapshot.exists()) {
      const storiesData = snapshot.val();
       // Firebase returns an object, convert it to an array and sort descending
      return Object.values<Story>(storiesData).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [];
  } catch (error) {
    console.error('Error getting all stories from Firebase:', error);
    return [];
  }
}

export async function getStoryById(storyId: string): Promise<Story | null> {
    try {
        const storyRef = ref(realtimeDb, `${STORIES_PATH}/${storyId}`);
        const snapshot = await get(storyRef);
        if (snapshot.exists()) {
            return snapshot.val() as Story;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching story by ID (${storyId}) from Firebase:`, error);
        return null;
    }
}

export async function getStoriesByUser(userId: string): Promise<Story[]> {
  try {
    const storiesRef = ref(realtimeDb, STORIES_PATH);
    const userStoriesQuery = query(storiesRef, orderByChild('userId'), equalTo(userId));
    const snapshot = await get(userStoriesQuery);

    if (snapshot.exists()) {
      const storiesData = snapshot.val();
      return Object.values<Story>(storiesData).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [];
  } catch (error) {
    console.error(`Error getting stories for user ${userId} from Firebase:`, error);
    return [];
  }
}

export async function updateStory(storyId: string, updates: Partial<Story>, authorId: string): Promise<Story | null> {
    const storyRef = ref(realtimeDb, `${STORIES_PATH}/${storyId}`);
    const snapshot = await get(storyRef);
    if (snapshot.exists()) {
        const story = snapshot.val() as Story;
        if (story.userId !== authorId) {
            throw new Error("User is not authorized to update this story.");
        }
        const updatedStory = { ...story, ...updates, updatedAt: new Date().toISOString() };
        await set(storyRef, updatedStory);
        return updatedStory;
    }
    return null;
}

export async function deleteStory(storyId: string, authorId: string): Promise<void> {
    const storyRef = ref(realtimeDb, `${STORIES_PATH}/${storyId}`);
    const snapshot = await get(storyRef);
    if (snapshot.exists()) {
        const story = snapshot.val() as Story;
        if (story.userId !== authorId) {
            throw new Error("User is not authorized to delete this story.");
        }
        await set(storyRef, null); // "Removes" the data by setting it to null
    }
}
