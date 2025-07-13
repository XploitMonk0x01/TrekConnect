import { io, Socket } from 'socket.io-client'

let socket: Socket

export const initSocket = (userId: string) => {
  if (!socket) {
    socket = io({
      path: '/api/socket',
      auth: {
        userId,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: false,
      timeout: 10000,
    })

    socket.on('connect', () => {
      console.log('Socket connected successfully')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
    })

    socket.on('error', (error: string) => {
      console.error('Socket error:', error)
    })
  }
  return socket
}

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket first.')
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
  }
}
