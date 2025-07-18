
'use server'

import {
  ref,
  push,
  get,
  set,
  query,
  orderByChild,
  serverTimestamp,
} from 'firebase/database'
import { realtimeDb } from '@/lib/firebase'
import type { Message } from '@/lib/types'

const MESSAGES_PATH = 'messages'

/**
 * Sends a message to a specific room in Firebase Realtime Database.
 * This function now includes a 'members' object to align with security rules.
 * @param roomId The ID of the chat room.
 * @param message The message object to send, without an ID or timestamp.
 */
export async function sendMessage(
  roomId: string,
  message: Omit<Message, 'id' | 'timestamp'>
) {
  try {
    const roomRef = ref(realtimeDb, `${MESSAGES_PATH}/${roomId}`)
    const newMessageRef = push(roomRef) // Generates a unique key for the message
    
    if (!newMessageRef.key) {
        throw new Error("Failed to generate a message key from Firebase.");
    }

    const messageData = {
      ...message,
      id: newMessageRef.key, // Save the generated key as the message ID
      timestamp: serverTimestamp(), // Use server-side timestamp for consistency
      // Add the members object for security rule validation
      members: {
        [message.senderId]: true,
        [message.recipientId]: true,
      },
    };

    await set(newMessageRef, messageData);
  } catch (error) {
    console.error('Error sending message to Firebase:', error) // Log the original error
    throw new Error('Failed to send message.')
  }
}

/**
 * Fetches a batch of messages for a room (not real-time).
 * @param roomId The ID of the chat room.
 * @param limit The number of messages to fetch.
 * @returns A promise that resolves to an array of messages.
 */
export async function getMessages(
  roomId: string,
  limit: number = 50
): Promise<Message[]> {
  const roomRef = ref(realtimeDb, `${MESSAGES_PATH}/${roomId}`)
  const messagesQuery = query(
    roomRef,
    orderByChild('timestamp')
  );

  const snapshot = await get(messagesQuery);
  if (snapshot.exists()) {
    return Object.values(snapshot.val()) as Message[]
  }
  return [];
}
