'use client'

import {
  ref,
  set,
  get,
  update,
  serverTimestamp,
  query,
  orderByChild,
} from 'firebase/database'
import { realtimeDb } from '@/lib/firebase'

export interface ChatRoom {
  id: string
  members: {
    [userId: string]: {
      name: string
      photoUrl?: string
      joinedAt: string | object
    }
  }
  lastMessage?: {
    content: string
    senderId: string
    timestamp: string | object
  }
  lastMessageTime: string | object
  createdAt: string | object
  unreadCount?: {
    [userId: string]: number
  }
}

const ROOMS_PATH = 'rooms'

/**
 * Creates or updates a chat room between two users
 */
export async function createOrGetRoom(
  currentUserId: string,
  otherUserId: string,
  currentUserName: string,
  otherUserName: string,
  currentUserPhoto?: string,
  otherUserPhoto?: string
): Promise<string> {
  // Generate consistent room ID
  const roomId = [currentUserId, otherUserId].sort().join('_')
  const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomId}`)

  try {
    // Check if room already exists
    const snapshot = await get(roomRef)

    if (!snapshot.exists()) {
      // Create new room atomically with required fields to satisfy rules
      await set(roomRef, {
        members: {
          [currentUserId]: {
            name: currentUserName,
            photoUrl: currentUserPhoto ?? null,
            joinedAt: serverTimestamp(),
          },
          [otherUserId]: {
            name: otherUserName,
            photoUrl: otherUserPhoto ?? null,
            joinedAt: serverTimestamp(),
          },
        },
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [currentUserId]: 0,
          [otherUserId]: 0,
        },
      })
    } else {
      // Update member info in case names/photos changed (partial update)
      const updates: Record<string, any> = {
        [`members/${currentUserId}/name`]: currentUserName,
        [`members/${otherUserId}/name`]: otherUserName,
      }

      if (currentUserPhoto !== undefined) {
        updates[`members/${currentUserId}/photoUrl`] = currentUserPhoto
      }
      if (otherUserPhoto !== undefined) {
        updates[`members/${otherUserId}/photoUrl`] = otherUserPhoto
      }

      await update(roomRef, updates)
    }

    return roomId
  } catch (error) {
    console.error('Error creating/getting room:', error)
    throw new Error('Failed to create or access chat room')
  }
}

/**
 * Updates room with last message info
 */
export async function updateRoomLastMessage(
  roomId: string,
  message: {
    content: string
    senderId: string
    timestamp: string | object
  }
): Promise<void> {
  const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomId}`)

  try {
    const snapshot = await get(roomRef)
    if (snapshot.exists()) {
      const roomData = snapshot.val()

      // Increment unread count for the recipient
      const memberIds = Object.keys(roomData.members || {})
      const recipientId = memberIds.find((id) => id !== message.senderId)

      const updates: Record<string, any> = {
        'lastMessage/content': message.content,
        'lastMessage/senderId': message.senderId,
        'lastMessage/timestamp': message.timestamp,
        lastMessageTime: message.timestamp,
      }
      if (recipientId) {
        const current = roomData.unreadCount?.[recipientId] || 0
        updates[`unreadCount/${recipientId}`] = current + 1
      }

      await update(roomRef, updates)
    }
  } catch (error) {
    console.error('Error updating room last message:', error)
  }
}

/**
 * Marks messages as read for a user in a room
 */
export async function markRoomAsRead(
  roomId: string,
  userId: string
): Promise<void> {
  const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomId}`)

  try {
    const snapshot = await get(roomRef)
    if (snapshot.exists()) {
      const updates: Record<string, any> = {
        [`unreadCount/${userId}`]: 0,
      }
      await update(roomRef, updates)
    }
  } catch (error) {
    console.error('Error marking room as read:', error)
  }
}

/**
 * Gets all rooms for a user
 */
export async function getUserRooms(userId: string): Promise<ChatRoom[]> {
  try {
    const roomsRef = ref(realtimeDb, ROOMS_PATH)
    const roomsQuery = query(roomsRef, orderByChild('lastMessageTime'))

    const snapshot = await get(roomsQuery)
    if (!snapshot.exists()) return []

    const allRooms = snapshot.val()
    const userRooms: ChatRoom[] = []

    Object.entries(allRooms).forEach(([roomId, roomData]: [string, any]) => {
      if (roomData.members && roomData.members[userId]) {
        userRooms.push({
          id: roomId,
          ...roomData,
        })
      }
    })

    // Sort by last message time (most recent first)
    return userRooms.sort((a, b) => {
      const timeA =
        typeof a.lastMessageTime === 'object'
          ? Date.now()
          : new Date(a.lastMessageTime as string).getTime()
      const timeB =
        typeof b.lastMessageTime === 'object'
          ? Date.now()
          : new Date(b.lastMessageTime as string).getTime()
      return timeB - timeA
    })
  } catch (error) {
    console.error('Error getting user rooms:', error)
    return []
  }
}
