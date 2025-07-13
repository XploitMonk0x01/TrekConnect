'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { io, Socket } from 'socket.io-client'
import { useCustomAuth } from './CustomAuthContext'
import type { Message } from '@/lib/types'

interface ChatContextType {
  isConnected: boolean
  messages: Message[]
  sendMessage: (roomId: string, content: string, recipientId: string) => void
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  isLoading: boolean
  error: string | null
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useCustomAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id && !socket) {
      setIsLoading(true)
      const newSocket = io({
        path: '/api/socket',
        auth: { userId: user.id },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        transports: ['websocket'],
        autoConnect: true,
      })

      newSocket.on('connect', () => {
        console.log('Chat socket connected:', newSocket.id)
        setSocket(newSocket)
        setIsConnected(true)
        setError(null)
        setIsLoading(false)
      })

      newSocket.on('disconnect', (reason) => {
        console.log('Chat socket disconnected:', reason)
        setIsConnected(false)
        setError('Chat disconnected. Reconnecting...')
      })

      newSocket.on('connect_error', (err) => {
        console.error('Chat connection error:', err)
        setError(`Connection failed: ${err.message}`)
        setIsLoading(false)
      })
      
      newSocket.on('messages', (roomMessages: Message[]) => {
          setMessages(roomMessages);
      });

      newSocket.on('message', (newMessage: Message) => {
        setMessages((prevMessages) => [...prevMessages, newMessage])
      })

      newSocket.on('error', (errorMessage: string) => {
        setError(errorMessage)
      })

      // Cleanup on component unmount
      return () => {
        newSocket.disconnect()
        setSocket(null)
      }
    } else if (!user && socket) {
      socket.disconnect()
      setSocket(null)
    }
  }, [user, socket])

  const joinRoom = useCallback(
    (roomId: string) => {
      if (socket && isConnected) {
        if (activeRoom && activeRoom !== roomId) {
          socket.emit('leave-room', activeRoom)
        }
        socket.emit('join-room', roomId)
        setActiveRoom(roomId)
        setMessages([]) // Clear messages from old room
      }
    },
    [socket, isConnected, activeRoom]
  )

  const leaveRoom = useCallback(
    (roomId: string) => {
      if (socket && isConnected) {
        socket.emit('leave-room', roomId)
        setActiveRoom(null)
        setMessages([])
      }
    },
    [socket, isConnected]
  )

  const sendMessage = useCallback(
    (roomId: string, content: string, recipientId: string) => {
      if (socket && isConnected && user) {
        const message: Partial<Message> = {
          roomId,
          content,
          senderId: user.id,
          recipientId,
          timestamp: new Date().toISOString(),
          read: false,
        }
        socket.emit('message', { roomId, message })
      } else {
        setError('Cannot send message. Not connected to chat.')
      }
    },
    [socket, isConnected, user]
  )

  const contextValue = {
    isConnected,
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    isLoading,
    error,
  }

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
}

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
