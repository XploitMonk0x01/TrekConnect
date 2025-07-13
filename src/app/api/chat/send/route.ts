import { NextRequest, NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { saveMessageToDatabase } from '@/lib/messages'
import { Message } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const message: Message = {
      id: crypto.randomUUID(),
      ...body,
      timestamp: new Date().toISOString(),
      read: false,
    }

    // Save message to database
    const saved = await saveMessageToDatabase(message)
    if (!saved) {
      throw new Error('Failed to save message')
    }

    // Trigger the message event in the specific room
    await pusherServer.trigger(
      `presence-room-${message.roomId}`,
      'message',
      message
    )

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
