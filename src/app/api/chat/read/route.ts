import { NextRequest, NextResponse } from 'next/server'
import { markMessageAsRead } from '@/lib/messages'

export async function POST(request: NextRequest) {
  try {
    const { messageId } = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    const success = await markMessageAsRead(messageId)
    if (!success) {
      throw new Error('Failed to mark message as read')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking message as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    )
  }
}
