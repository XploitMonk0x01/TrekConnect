
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
} from '@/services/messages.client'
import { sendMessage as firebaseSendMessage } from '@/services/messages'
import { useToast } from '@/hooks/use-toast'

interface ChatContextType {
  messages: Message[]
  sendMessage: (roomId: string, content: string, recipientId: string) => Promise<void>
  joinRoom: (roomId: string) => void
  leaveRoom: () => void
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
  const unsubscribeCallback = useRef<(() => void) | null>(null);

  const handleMessagesUpdate = useCallback((newMessages: Message[]) => {
    setMessages(newMessages)
    setIsLoading(false)
    setIsConnected(true)
    setError(null)
  }, [])

  const handleError = useCallback((err: Error) => {
    setError(err.message)
    setIsLoading(false)
    setIsConnected(false)
    toast({
        variant: 'destructive',
        title: 'Chat Error',
        description: err.message,
    });
  }, [toast])

  const joinRoom = useCallback(
    (roomId: string) => {
      // **Fix**: Do not proceed if auth is still loading or user is not logged in.
      // The page component will call this function again once auth is ready.
      if (authIsLoading || !user) {
        setIsLoading(true); // Show loading state while waiting for auth
        return;
      }
      
      if (currentRoomId.current === roomId && unsubscribeCallback.current) {
        return; // Already in the room and listening
      }
      
      // Leave previous room if there was one
      if (unsubscribeCallback.current) {
        unsubscribeCallback.current();
        unsubscribeCallback.current = null;
      }

      setIsLoading(true)
      setMessages([])
      setError(null)
      currentRoomId.current = roomId
      
      // Start listening to the new room
      unsubscribeCallback.current = listenForMessages(roomId, handleMessagesUpdate, handleError);
    },
    [handleMessagesUpdate, handleError, user, authIsLoading]
  )

  const leaveRoom = useCallback(() => {
    if (unsubscribeCallback.current) {
      unsubscribeCallback.current()
      unsubscribeCallback.current = null;
    }
    currentRoomId.current = null;
    setMessages([]);
    setIsConnected(false);
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
    if(authIsLoading || !user) {
        setIsLoading(authIsLoading);
        setIsConnected(false);
        if (currentRoomId.current) {
            leaveRoom();
        }
    }
  }, [user, authIsLoading, leaveRoom])


  const sendMessage = async (
    roomId: string,
    content: string,
    recipientId: string
  ) => {
    if (!user) {
      const err = 'You must be logged in to send messages.'
      setError(err)
      toast({ variant: 'destructive', title: 'Error', description: err });
      throw new Error(err)
    }
    if (!recipientId) {
      const err = 'Recipient not found. Cannot send message.'
      setError(err)
      toast({ variant: 'destructive', title: 'Error', description: err });
      throw new Error(err);
    }

    const messagePayload: Omit<Message, 'id' | 'timestamp'> = {
      roomId,
      content,
      senderId: user.id,
      recipientId,
      read: false,
    }

    try {
      await firebaseSendMessage(roomId, messagePayload)
    } catch (err: any) {
      setError(err.message)
      toast({ variant: 'destructive', title: 'Send Error', description: err.message });
      console.error('Failed to send message:', err)
      throw err
    }
  }

  const value = {
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
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
