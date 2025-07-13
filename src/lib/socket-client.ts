import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const connectSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/api/socket',
      addTrailingSlash: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const joinRoom = (roomId: string) => {
  if (socket) {
    socket.emit('join-room', roomId)
  }
}

export const leaveRoom = (roomId: string) => {
  if (socket) {
    socket.emit('leave-room', roomId)
  }
}

export const sendMessage = (roomId: string, message: any) => {
  if (socket) {
    socket.emit('message', { roomId, message })
  }
}

export default {
  connectSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  sendMessage,
}
