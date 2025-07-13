import { NextRequest, NextResponse } from 'next/server'
import { getMessagesForRoom } from '@/lib/messages'

export async function GET(request: NextRequest) {
  try {
    // Get roomId from URL params
    const url = new URL(request.url)
    const roomId = url.searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const messages = await getMessagesForRoom(roomId)
    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
