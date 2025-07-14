import { NextRequest } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import type { Message } from '@/lib/types'
import { realtimeDb } from '@/lib/firebase'
import { ref, set, push, onValue } from 'firebase/database'

let io: SocketIOServer | undefined

// This is needed for Next.js edge runtime compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

if (!io) {
  io = new SocketIOServer({
    path: '/api/socket',
    addTrailingSlash: false,
    transports: ['websocket', 'polling'],
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    connectionStateRecovery: {
      // the backup duration of the sessions and the packets
      maxDisconnectionDuration: 2 * 60 * 1000,
      // whether to skip middlewares upon successful recovery
      skipMiddlewares: true,
    },
  })

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId
    if (!userId) {
      console.error(
        `[Socket Auth Middleware] Failed: No userId in handshake.auth for socket ${socket.id}`
      )
      return next(new Error('Authentication error: userId missing'))
    }
    socket.data.userId = userId
    console.log(
      `[Socket Auth Middleware] Success: User ${userId} authenticated for socket ${socket.id}`
    )
    next()
  })

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId)
      console.log(`User ${socket.userId} joined room ${roomId}`)

      // Subscribe to Firebase room messages
      const roomRef = ref(realtimeDb, `messages/${roomId}`)
      onValue(roomRef, (snapshot) => {
        const messages = snapshot.val()
        if (messages) {
          socket.emit('messages', Object.values(messages))
        }
      })
    })

    socket.on('message', async (data: { roomId: string; message: Message }) => {
      try {
        const { roomId, message } = data

        // Save to Firebase Realtime Database
        const roomRef = ref(realtimeDb, `messages/${roomId}`)
        const newMessageRef = push(roomRef)
        await set(newMessageRef, {
          ...message,
          timestamp: Date.now(),
          read: false,
        })

        // Broadcast to room
        io?.to(roomId).emit('message', message)
      } catch (error) {
        console.error('Error handling message:', error)
        socket.emit('error', 'Failed to send message')
      }
    })

    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId)
      console.log(`User ${socket.userId} left room ${roomId}`)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id)
    })
  })
}

export async function GET(req: NextRequest) {
  if (!io) {
    return new Response('Socket.io server not initialized', { status: 500 })
  }
  return new Response('Socket.io server running')
}

export async function POST(req: NextRequest) {
  try {
    if (!io) {
      return new Response('Socket.io server not initialized', { status: 500 })
    }

    const body = await req.json()
    const { event, room, data } = body

    if (room) {
      io.to(room).emit(event, data)
    } else {
      io.emit(event, data)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in socket POST route:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
