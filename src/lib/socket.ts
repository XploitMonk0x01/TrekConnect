
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
      console.error('[Socket Init] Socket server not found on response object.');
      throw new Error('Socket server not found')
    }

    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*", // Adjust in production for security
        methods: ["GET", "POST"]
      }
    })
    console.log('[Socket Init] New Socket.IO server initialized.');

    io.use((socket, next) => {
      const userId = socket.handshake.auth.userId
      if (!userId) {
        console.error(`[Socket Auth Middleware] Failed: No userId in handshake.auth for socket ${socket.id}. Handshake auth:`, socket.handshake.auth);
        return next(new Error('Authentication error: userId missing'))
      }
      socket.data.userId = userId
      console.log(`[Socket Auth Middleware] Success: User ${userId} attempting to connect with socket ${socket.id}`);
      next()
    })

    io.on('connection', (socket) => {
      console.log(`[Socket Connection] Client connected: ${socket.id}, User ID: ${socket.data.userId}`)

      socket.on('join-room', async (roomId: string) => {
        const userId = socket.data.userId
        if (!userId) {
          console.error(`[Socket Join Room] Auth error for socket ${socket.id} trying to join ${roomId}`);
          socket.emit('error', 'Authentication required to join room')
          return
        }

        socket.join(roomId)
        console.log(`[Socket Join Room] Socket ${socket.id} (User: ${userId}) joined room ${roomId}`)

        try {
          const messages = await getMessages(roomId)
          socket.emit('load-messages', messages)
          console.log(`[Socket Join Room] Loaded ${messages.length} messages for room ${roomId} for user ${userId}`);
          await markMessagesAsRead(roomId, userId)
        } catch (error) {
          console.error(`[Socket Join Room] Error loading messages for room ${roomId}:`, error)
          socket.emit('error', 'Failed to load messages')
        }
      })

      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId)
        console.log(`[Socket Leave Room] Socket ${socket.id} (User: ${socket.data.userId}) left room ${roomId}`)
      })

      socket.on(
        'send-message',
        async (data: { roomId: string; message: Message }) => {
          const senderId = socket.data.userId
          if (!senderId) {
            console.error(`[Socket Send Message] Auth error for socket ${socket.id} trying to send to ${data.roomId}`);
            socket.emit('error', 'Authentication required to send message')
            return
          }

          // Ensure the senderId in the message payload matches the authenticated socket user
          if (data.message.senderId !== senderId) {
            console.warn(`[Socket Send Message] SenderId mismatch: socket user ${senderId}, message payload sender ${data.message.senderId}. Using socket user.`);
          }

          try {
            const messageToSave: Message = {
              ...data.message,
              roomId: data.roomId,
              senderId: senderId, // Ensure senderId is from the authenticated socket
              timestamp: new Date(data.message.timestamp || Date.now()), // Ensure timestamp is a Date object
              read: false, // Messages are initially unread
            };
            
            console.log(`[Socket Send Message] User ${senderId} sending message to room ${data.roomId}:`, messageToSave.content);
            const savedMessage = await saveMessage(messageToSave)
            
            // Broadcast message to all clients in the room including sender
            io?.to(data.roomId).emit('receive-message', savedMessage)
            console.log(`[Socket Send Message] Message broadcasted to room ${data.roomId}`);
          } catch (error) {
            console.error(`[Socket Send Message] Error saving/sending message for room ${data.roomId}:`, error)
            socket.emit('error', 'Failed to send message')
          }
        }
      )

      socket.on('disconnect', (reason) => {
        console.log(`[Socket Disconnect] Client disconnected: ${socket.id} (User: ${socket.data.userId}), Reason: ${reason}`)
      })

      socket.on('error', (err) => {
        console.error(`[Socket Error] Error on socket ${socket.id} (User: ${socket.data.userId}):`, err.message);
      });
    })
  } else {
     console.log('[Socket Init] Socket.IO server already initialized.');
  }

  return io
}

    