
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react'
import { io, Socket } from 'socket.io-client'
import { useCustomAuth } from './CustomAuthContext'
import type { Message } from '@/lib/types'

interface ChatContextType {
  socket: Socket | null
  messages: Message[]
  sendMessage: (roomId: string, content: string, receiverUserId: string) => void // Added receiverUserId
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  isLoading: boolean
  error: string | null
}

const ChatContext = createContext<ChatContextType>({
  socket: null,
  messages: [],
  sendMessage: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  isLoading: false,
  error: null,
})

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useCustomAuth()
  const socketRef = useRef<Socket | null>(null)

  const handleReceiveMessage = useCallback((message: Message) => {
    console.log('Received message:', message)
    setMessages((prev) => [...prev, message])
  }, [])

  const handleLoadMessages = useCallback((loadedMessages: Message[]) => {
    console.log('Loaded messages:', loadedMessages)
    setMessages(loadedMessages)
  }, [])

  const handleError = useCallback((errorMessage: string) => {
    console.error('Socket error:', errorMessage)
    setError(errorMessage)
  }, [])

  const handleConnect = useCallback(() => {
    console.log('Connected to socket server')
    setError(null)
  }, [])

  const handleConnectError = useCallback((err: Error) => {
    console.error('Socket connection error:', err)
    setError('Failed to connect to chat server')
  }, [])

  const sendMessage = useCallback(
    (roomId: string, content: string, receiverUserId: string) => { // Added receiverUserId
      if (!socketRef.current || !user) {
        console.error('Socket not connected or user not authenticated')
        return
      }

      console.log('Sending message:', { roomId, content, userId: user.id, receiverUserId })

      const message: Message = {
        id: Math.random().toString(36).substring(7), // Client-side ID, server may re-assign if needed
        roomId,
        senderId: user.id,
        receiverId: receiverUserId, // Correctly use receiverUserId
        content,
        timestamp: new Date(),
        read: false,
      }

      socketRef.current.emit('send-message', { roomId, message })
    },
    [user]
  )

  const joinRoom = useCallback(
    (roomId: string) => {
      if (!socketRef.current || !user) {
        console.error('Socket not connected or user not authenticated')
        return
      }

      console.log('Joining room:', roomId)
      setMessages([]) // Clear messages from previous room
      socketRef.current.emit('join-room', roomId)
    },
    [user]
  )

  const leaveRoom = useCallback((roomId: string) => {
    if (!socketRef.current) {
      console.error('Socket not connected')
      return
    }

    console.log('Leaving room:', roomId)
    socketRef.current.emit('leave-room', roomId)
    setMessages([])
  }, [])

  useEffect(() => {
    const initializeSocket = async () => {
      if (!user) {
        console.log('User not authenticated, skipping socket initialization')
        if (socketRef.current) { // If user signs out, disconnect existing socket
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
        }
        return
      }

      // Prevent re-initialization if socket already exists and is connected for the current user
      if (socketRef.current && socketRef.current.connected && socketRef.current.auth.userId === user.id) {
        return;
      }
      
      // If there's an old socket, disconnect it before creating a new one
      if (socketRef.current) {
        socketRef.current.disconnect();
      }


      try {
        setIsLoading(true)
        console.log('Initializing socket connection...')
        // Ensure the API route is available
        await fetch('/api/socket').catch(err => console.warn("Pre-fetch to /api/socket failed, continuing with socket connection attempt.", err));


        const socketInstance = io({
          path: '/api/socket',
          addTrailingSlash: false,
          auth: { // Pass userId for server-side authentication of the socket
            userId: user.id,
          },
          reconnectionAttempts: 5, // Attempt to reconnect
        })

        socketInstance.on('connect', handleConnect)
        socketInstance.on('connect_error', handleConnectError)
        socketInstance.on('receive-message', handleReceiveMessage)
        socketInstance.on('load-messages', handleLoadMessages)
        socketInstance.on('error', handleError)

        socketRef.current = socketInstance
        setSocket(socketInstance)
      } catch (error) {
        console.error('Failed to initialize socket:', error)
        setError('Failed to initialize chat')
      } finally {
        setIsLoading(false)
      }
    }

    initializeSocket()

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection in ChatContext useEffect return...')
        socketRef.current.off('connect', handleConnect)
        socketRef.current.off('connect_error', handleConnectError)
        socketRef.current.off('receive-message', handleReceiveMessage)
        socketRef.current.off('load-messages', handleLoadMessages)
        socketRef.current.off('error', handleError)
        // Only disconnect if it's truly unmounting, not on user change if re-init is handled
        // socketRef.current.disconnect(); 
        // socketRef.current = null;
      }
    }
  }, [
    user, // Re-run if user changes (e.g., login/logout)
    handleConnect,
    handleConnectError,
    handleReceiveMessage,
    handleLoadMessages,
    handleError,
  ])

  return (
    <ChatContext.Provider
      value={{
        socket,
        messages,
        sendMessage,
        joinRoom,
        leaveRoom,
        isLoading,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
