import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextResponse } from 'next/server'
import {
  saveMessage,
  getMessages,
  markMessagesAsRead,
} from '@/services/messages'
import type { Message } from '@/lib/types'

let io: SocketIOServer | null = null

export const initSocket = async (res: NextResponse) => {
  if (!io) {
    const httpServer = (res as any).socket?.server
    if (!httpServer) {
      throw new Error('Socket server not found')
    }

    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    })

    io.use((socket, next) => {
      const userId = socket.handshake.auth.userId
      if (!userId) {
        return next(new Error('Authentication error'))
      }
      socket.data.userId = userId
      next()
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join-room', async (roomId: string) => {
        const userId = socket.data.userId
        if (!userId) {
          socket.emit('error', 'Authentication required')
          return
        }

        socket.join(roomId)
        console.log(`Socket ${socket.id} joined room ${roomId}`)

        try {
          // Load previous messages when joining a room
          const messages = await getMessages(roomId)
          socket.emit('load-messages', messages)

          // Mark messages as read when joining a room
          await markMessagesAsRead(roomId, userId)
        } catch (error) {
          console.error('Error loading messages:', error)
          socket.emit('error', 'Failed to load messages')
        }
      })

      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId)
        console.log(`Socket ${socket.id} left room ${roomId}`)
      })

      socket.on(
        'send-message',
        async (data: { roomId: string; message: Message }) => {
          const userId = socket.data.userId
          if (!userId) {
            socket.emit('error', 'Authentication required')
            return
          }

          try {
            // Save message to database
            const savedMessage = await saveMessage({
              ...data.message,
              roomId: data.roomId,
              senderId: userId,
              read: false,
            })

            // Broadcast message to all clients in the room
            io?.to(data.roomId).emit('receive-message', savedMessage)
          } catch (error) {
            console.error('Error saving message:', error)
            socket.emit('error', 'Failed to send message')
          }
        }
      )

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }

  return io
}
