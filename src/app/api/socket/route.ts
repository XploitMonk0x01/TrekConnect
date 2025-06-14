import { NextResponse } from 'next/server'
import { initSocket } from '@/lib/socket'

export async function GET(req: Request) {
  try {
    const res = new NextResponse()
    const io = await initSocket(res)
    if (!io) {
      throw new Error('Failed to initialize socket server')
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Socket initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize socket' },
      { status: 500 }
    )
  }
}
