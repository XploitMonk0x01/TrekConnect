import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { NextApiResponseServerIO } from '@/lib/types'

export const config = {
  api: {
    bodyParser: false,
  },
}

const initSocketServer = (
  req: NextApiRequest,
  res: NextApiResponseServerIO
) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    })

    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id)

      socket.on('join-room', (roomId: string) => {
        socket.join(roomId)
        console.log(`User ${socket.id} joined room ${roomId}`)
      })

      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId)
        console.log(`User ${socket.id} left room ${roomId}`)
      })

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id)
      })
    })
  }
  return res.socket.server.io
}

export default initSocketServer
