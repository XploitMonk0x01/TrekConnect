import {
  ref,
  push,
  get,
  set,
  update,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database'
import { realtimeDb } from '@/lib/firebase'
import type { Message } from '@/lib/types'

const MESSAGES_REF = 'messages'

export async function saveMessage(
  message: Omit<Message, 'id'>
): Promise<Message> {
  try {
    const messagesRef = ref(realtimeDb, MESSAGES_REF)
    const newMessageRef = push(messagesRef)

    const messageDoc: Message = {
      id: newMessageRef.key!,
      roomId: message.roomId,
      senderId: message.senderId,
      recipientId: message.recipientId,
      content: message.content,
      timestamp: new Date(message.timestamp).toISOString(),
      read: message.read || false,
    }

    await set(newMessageRef, messageDoc)
    console.log('Message saved to Firebase:', messageDoc)

    return messageDoc
  } catch (error) {
    console.error('Error saving message to Firebase:', error)
    throw error
  }
}

export async function getMessages(
  roomId: string,
  limit: number = 50
): Promise<Message[]> {
  const messagesRef = ref(realtimeDb, MESSAGES_REF)
  const messagesQuery = query(
    messagesRef,
    orderByChild('roomId'),
    equalTo(roomId)
  )

  const snapshot = await get(messagesQuery)
  const messages = snapshot.val() || {}

  return Object.values(messages)
    .sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit)
}

export async function markMessagesAsRead(
  roomId: string,
  userId: string
): Promise<void> {
  const messagesRef = ref(realtimeDb, MESSAGES_REF)
  const messagesQuery = query(
    messagesRef,
    orderByChild('roomId'),
    equalTo(roomId)
  )

  const snapshot = await get(messagesQuery)
  const updates: { [key: string]: any } = {}

  Object.entries(snapshot.val() || {}).forEach(
    ([key, value]: [string, any]) => {
      if (value.receiverId === userId && !value.read) {
        updates[`${key}/read`] = true
      }
    }
  )

  if (Object.keys(updates).length > 0) {
    await update(ref(realtimeDb, MESSAGES_REF), updates)
  }
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const messagesRef = ref(realtimeDb, MESSAGES_REF)
  const messagesQuery = query(
    messagesRef,
    orderByChild('recipientId'),
    equalTo(userId)
  )

  const snapshot = await get(messagesQuery)
  const messages = Object.values(snapshot.val() || {})
  return messages.filter((msg: any) => !msg.read).length
}

export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<boolean> {
  const messageRef = ref(realtimeDb, `${MESSAGES_REF}/${messageId}`)
  const snapshot = await get(messageRef)
  const message = snapshot.val()

  if (!message || message.senderId !== userId) {
    return false
  }

  await update(ref(realtimeDb, MESSAGES_REF), { [messageId]: null })
  return true
}
