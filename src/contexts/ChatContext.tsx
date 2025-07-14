
'use client'

import React,
{
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react'
import { io, Socket } from 'socket.io-client'
import type { Message } from '@/lib/types'
import { useCustomAuth } from './CustomAuthContext'

interface ChatContextType {
  messages: Message[]
  sendMessage: (roomId: string, content: string, recipientId: string) => void
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  isConnected: boolean
  isLoading: boolean
  error: string | null
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authIsLoading } = useCustomAuth()
  const socketRef = useRef<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authIsLoading) {
      return // Wait for auth to complete
    }

    if (!user) {
      setIsLoading(false)
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    // Initialize socket connection
    const initSocket = async () => {
      // Ensure existing socket is disconnected before creating a new one
      if (socketRef.current) {
        socketRef.current.disconnect()
      }

      await fetch('/api/socket')
      const newSocket = io({
        path: '/api/socket',
        query: { userId: user.id },
      })
      socketRef.current = newSocket

      newSocket.on('connect', () => {
        setIsConnected(true)
        setIsLoading(false)
        setError(null)
      })

      newSocket.on('connect_error', (err) => {
        setError(err.message)
        setIsConnected(false)
        setIsLoading(false)
      })

      newSocket.on('disconnect', () => {
        setIsConnected(false)
      })

      newSocket.on('receive_message', (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message])
      })
      
      newSocket.on('load_messages', (loadedMessages: Message[]) => {
          setMessages(loadedMessages)
      })
    }

    initSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [user, authIsLoading])

  const sendMessage = useCallback(
    (roomId: string, content: string, recipientId: string) => {
      if (socketRef.current && user) {
        const messagePayload: Omit<Message, 'id'> = {
          roomId,
          content,
          senderId: user.id,
          recipientId,
          timestamp: new Date().toISOString(),
          read: false,
        }
        socketRef.current.emit('send_message', messagePayload)
        // Optimistically update UI
        setMessages((prev) => [...prev, { ...messagePayload, id: `temp-${Date.now()}` }])
      }
    },
    [user]
  )

  const joinRoom = useCallback((roomId: string) => {
    if (socketRef.current) {
      setMessages([]); // Clear messages from previous room
      socketRef.current.emit('join_room', roomId)
    }
  }, [])

  const leaveRoom = useCallback((roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room', roomId)
    }
  }, [])

  const value = {
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    isConnected,
    isLoading,
    error,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
