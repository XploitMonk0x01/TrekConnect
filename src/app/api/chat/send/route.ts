import { NextRequest, NextResponse } from 'next/server'
import { saveMessageToDatabase } from '@/lib/messages'
import { Message } from '@/lib/types'
import { z } from 'zod'

// Define a schema for the incoming message payload for validation
const sendMessageSchema = z.object({
  roomId: z.string().min(1),
  senderId: z.string().min(1),
  recipientId: z.string().min(1),
  content: z.string().min(1).max(2000), // Added max length for content
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body against the schema
    const validation = sendMessageSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid message payload', details: validation.error.errors },
        { status: 400 }
      )
    }

    const message: Message = {
      id: crypto.randomUUID(),
      ...validation.data,
      timestamp: new Date().toISOString(),
      read: false,
    }

    // Save message to database
    const saved = await saveMessageToDatabase(message)
    if (!saved) {
      throw new Error('Failed to save message')
    }

    // Trigger the message event in the specific room
    // await pusherServer.trigger(
    //   `presence-room-${message.roomId}`,
    //   'message',
    //   message
    // )
    // Removed Pusher trigger logic

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
