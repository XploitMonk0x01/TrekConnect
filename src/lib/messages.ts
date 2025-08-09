import { getDb } from '@/lib/mongodb'
import { Message } from '@/lib/types'

export async function saveMessageToDatabase(message: Message) {
  const db = await getDb()

  try {
    await db.collection('messages').insertOne({
      ...message,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return true
  } catch (error) {
    console.error('Error saving message to database:', error)
    return false
  }
}

export async function getMessagesForRoom(roomId: string) {
  const db = await getDb()

  try {
    const messages = await db
      .collection('messages')
      .find({ roomId })
      .sort({ timestamp: 1 })
      .toArray()

    return messages
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

export async function markMessageAsRead(messageId: string) {
  const db = await getDb()

  try {
    await db
      .collection('messages')
      .updateOne(
        { id: messageId },
        { $set: { read: true, updatedAt: new Date() } }
      )
    return true
  } catch (error) {
    console.error('Error marking message as read:', error)
    return false
  }
}
