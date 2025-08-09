'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react'
import type { Message } from '@/lib/types'
import { useCustomAuth } from './CustomAuthContext'
import {
  listenForMessages,
  sendMessage as clientSendMessage,
} from '@/services/messages.client'
import { createOrGetRoom, markRoomAsRead } from '@/services/rooms'
import { useToast } from '@/hooks/use-toast'

interface ChatContextType {
  messages: Message[]
  sendMessage: (
    roomId: string,
    content: string,
    recipientId: string,
    recipientName?: string,
    recipientPhoto?: string
  ) => Promise<void>
  joinRoom: (
    roomId: string,
    otherUserId?: string,
    otherUserName?: string,
    otherUserPhoto?: string
  ) => void
  leaveRoom: () => void
  markAsRead: (roomId: string) => void
  isConnected: boolean
  isLoading: boolean
  error: string | null
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authIsLoading } = useCustomAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentRoomId = useRef<string | null>(null)
  const unsubscribeCallback = useRef<(() => void) | null>(null)

  const handleMessagesUpdate = useCallback((newMessages: Message[]) => {
    setMessages(newMessages)
    setIsLoading(false)
    setIsConnected(true)
    setError(null)
  }, [])

  const handleError = useCallback(
    (err: Error) => {
      setError(err.message)
      setIsLoading(false)
      setIsConnected(false)
      toast({
        variant: 'destructive',
        title: 'Chat Error',
        description: err.message,
      })
    },
    [toast]
  )

  const joinRoom = useCallback(
    async (
      roomId: string,
      otherUserId?: string,
      otherUserName?: string,
      otherUserPhoto?: string
    ) => {
      // **Fix**: Do not proceed if auth is still loading or user is not logged in.
      // The page component will call this function again once auth is ready.
      if (authIsLoading || !user) {
        setIsLoading(true) // Show loading state while waiting for auth
        return
      }

      if (currentRoomId.current === roomId && unsubscribeCallback.current) {
        return // Already in the room and listening
      }

      // Leave previous room if there was one
      if (unsubscribeCallback.current) {
        unsubscribeCallback.current()
        unsubscribeCallback.current = null
      }

      setIsLoading(true)
      setMessages([])
      setError(null)

      try {
        // Create or get the room if other user info is provided
        if (otherUserId && otherUserName) {
          await createOrGetRoom(
            user.id,
            otherUserId,
            user.name || 'User',
            otherUserName,
            user.photoUrl,
            otherUserPhoto
          )
        }

        currentRoomId.current = roomId

        // Start listening to the new room
        unsubscribeCallback.current = listenForMessages(
          roomId,
          handleMessagesUpdate,
          handleError
        )

        // Mark room as read when joining
        await markRoomAsRead(roomId, user.id)
      } catch (error) {
        console.error('Error joining room:', error)
        handleError(new Error('Failed to join chat room'))
      }
    },
    [handleMessagesUpdate, handleError, user, authIsLoading]
  )

  const leaveRoom = useCallback(() => {
    if (unsubscribeCallback.current) {
      unsubscribeCallback.current()
      unsubscribeCallback.current = null
    }
    currentRoomId.current = null
    setMessages([])
    setIsConnected(false)
  }, [])

  // Cleanup on unmount or user change
  useEffect(() => {
    return () => {
      if (unsubscribeCallback.current) {
        unsubscribeCallback.current()
      }
    }
  }, [])

  useEffect(() => {
    // When auth is loading or no user, we are not connected.
    if (authIsLoading || !user) {
      setIsLoading(authIsLoading)
      setIsConnected(false)
      if (currentRoomId.current) {
        leaveRoom()
      }
    }
  }, [user, authIsLoading, leaveRoom])

  const markAsRead = useCallback(
    async (roomId: string) => {
      if (!user) return
      try {
        await markRoomAsRead(roomId, user.id)
      } catch (error) {
        console.error('Error marking room as read:', error)
      }
    },
    [user]
  )

  const sendMessage = async (
    roomId: string,
    content: string,
    recipientId: string,
    recipientName?: string,
    recipientPhoto?: string
  ) => {
    if (!user) {
      const err = 'You must be logged in to send messages.'
      setError(err)
      toast({ variant: 'destructive', title: 'Error', description: err })
      throw new Error(err)
    }
    if (!recipientId) {
      const err = 'Recipient not found. Cannot send message.'
      setError(err)
      toast({ variant: 'destructive', title: 'Error', description: err })
      throw new Error(err)
    }

    try {
      // Ensure room exists before sending message
      if (recipientName) {
        await createOrGetRoom(
          user.id,
          recipientId,
          user.name || 'User',
          recipientName,
          user.photoUrl,
          recipientPhoto
        )
      }

      const messagePayload: Omit<Message, 'id' | 'timestamp'> = {
        roomId,
        content,
        senderId: user.id,
        recipientId,
        read: false,
      }

      await clientSendMessage(roomId, messagePayload)
    } catch (err: any) {
      setError(err.message)
      toast({
        variant: 'destructive',
        title: 'Send Error',
        description: err.message,
      })
      console.error('Failed to send message:', err)
      throw err
    }
  }

  const value = {
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    markAsRead,
    isConnected,
    isLoading: isLoading && !error,
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
