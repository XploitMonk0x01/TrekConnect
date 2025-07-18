
'use client';

import {
  ref,
  query,
  orderByChild,
  onValue,
  off,
  DataSnapshot,
} from 'firebase/database';
import { realtimeDb } from '@/lib/firebase';
import type { Message } from '@/lib/types';

const MESSAGES_PATH = 'messages';

/**
 * Sets up a real-time listener for messages in a specific room.
 * This is a client-side function.
 * @param roomId The ID of the chat room to listen to.
 * @param callback The function to call with the array of messages whenever they change.
 * @param errorCallback The function to call if there's a permission error.
 * @returns An unsubscribe function to stop listening.
 */
export function listenForMessages(
  roomId: string,
  callback: (messages: Message[]) => void,
  errorCallback: (error: Error) => void
): () => void {
  const roomRef = ref(realtimeDb, `${MESSAGES_PATH}/${roomId}`);
  const messagesQuery = query(roomRef, orderByChild('timestamp'));

  const listener = onValue(
    messagesQuery,
    (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesArray: Message[] = Object.values(messagesData);
        // Sorting should be handled by the query, but we can ensure it here too.
        callback(messagesArray);
      } else {
        // No messages in the room yet
        callback([]);
      }
    },
    (error) => {
      console.error(`Firebase listener error for room ${roomId}:`, error);
      errorCallback(new Error('Permission denied or network error.'));
    }
  );

  // Return the unsubscribe function
  return () => {
    off(messagesQuery, 'value', listener);
  };
}

/**
 * A wrapper to explicitly stop a listener.
 * This is a client-side function.
 * @param unsubscribe The function returned by listenForMessages.
 */
export function stopListeningForMessages(unsubscribe: () => void) {
  if (unsubscribe) {
    unsubscribe();
  }
}
