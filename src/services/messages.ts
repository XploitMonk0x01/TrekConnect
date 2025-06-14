import { ObjectId } from 'mongodb'
import { getMongoDB } from '@/lib/mongodb'
import type { Message } from '@/lib/types'

interface MessageDocument {
  _id: ObjectId
  roomId: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
}

export async function saveMessage(
  message: Omit<Message, 'id'>
): Promise<Message> {
  try {
    const { db } = await getMongoDB()
    const messagesCollection = db.collection<MessageDocument>('messages')

    const messageDoc: MessageDocument = {
      _id: new ObjectId(),
      roomId: message.roomId,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      timestamp: new Date(message.timestamp),
      read: message.read || false,
    }

    const result = await messagesCollection.insertOne(messageDoc)
    if (result.insertedId) {
      console.log('Message saved to MongoDB:', messageDoc)
    } else {
      console.error('Failed to insert message into MongoDB:', messageDoc)
    }

    return {
      id: messageDoc._id.toString(),
      roomId: messageDoc.roomId,
      senderId: messageDoc.senderId,
      receiverId: messageDoc.receiverId,
      content: messageDoc.content,
      timestamp: messageDoc.timestamp,
      read: messageDoc.read,
    }
  } catch (error) {
    console.error('Error saving message to MongoDB:', error)
    throw error
  }
}

export async function getMessages(
  roomId: string,
  limit: number = 50
): Promise<Message[]> {
  const { db } = await getMongoDB()
  const messagesCollection = db.collection<MessageDocument>('messages')

  const messages = await messagesCollection
    .find({ roomId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray()

  return messages.map((msg) => ({
    id: msg._id.toString(),
    roomId: msg.roomId,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    content: msg.content,
    timestamp: msg.timestamp,
    read: msg.read,
  }))
}

export async function markMessagesAsRead(
  roomId: string,
  userId: string
): Promise<void> {
  const { db } = await getMongoDB()
  const messagesCollection = db.collection<MessageDocument>('messages')

  await messagesCollection.updateMany(
    {
      roomId,
      receiverId: userId,
      read: false,
    },
    {
      $set: { read: true },
    }
  )
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const { db } = await getMongoDB()
  const messagesCollection = db.collection<MessageDocument>('messages')

  return messagesCollection.countDocuments({
    receiverId: userId,
    read: false,
  })
}

export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<boolean> {
  const { db } = await getMongoDB()
  const messagesCollection = db.collection<MessageDocument>('messages')

  const result = await messagesCollection.deleteOne({
    _id: new ObjectId(messageId),
    senderId: userId, // Only allow sender to delete their own messages
  })

  return result.deletedCount > 0
}
