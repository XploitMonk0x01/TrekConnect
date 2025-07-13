'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { ref, onValue, off, push, serverTimestamp } from 'firebase/database'
import { realtimeDb } from '@/lib/firebase'
import { useCustomAuth } from './CustomAuthContext'
import type { Message } from '@/lib/types'

interface ChatContextType {
  messages: Message[]
  sendMessage: (roomId: string, content: string, recipientId: string) => void
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  isLoading: boolean
  error: string | null
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  isLoading: false,
  error: null,
})

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentRoomRef, setCurrentRoomRef] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useCustomAuth()

  const sendMessage = useCallback(
    async (roomId: string, content: string, recipientId: string) => {
      if (!user) {
        setError('Must be logged in to send messages')
        return
      }

      try {
        const messagesRef = ref(realtimeDb, 'messages')
        const newMessageRef = push(messagesRef)

        const message = {
          id: newMessageRef.key,
          roomId,
          content,
          senderId: user.id,
          recipientId,
          timestamp: serverTimestamp(),
          read: false,
        }

        await push(messagesRef, message)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message')
        console.error('Error sending message:', err)
      }
    },
    [user]
  )

  const joinRoom = useCallback(
    (roomId: string) => {
      if (!user) {
        setError('Must be logged in to join a chat room')
        return
      }

      setIsLoading(true)

      try {
        // Leave current room if exists
        if (currentRoomRef) {
          const prevRef = ref(realtimeDb, `messages/${currentRoomRef}`)
          off(prevRef)
        }

        // Subscribe to new room's messages
        const roomRef = ref(realtimeDb, 'messages')

        // Handle connection states
        pusherClient.connection.bind(
          'state_change',
          (states: { previous: string; current: string }) => {
            console.log('Pusher connection state:', states.current)
            if (states.current === 'connected') {
              setError(null)
            } else if (states.current === 'connecting') {
              setError('Connecting to chat...')
            } else if (
              states.current === 'disconnected' ||
              states.current === 'failed'
            ) {
              setError('Chat disconnected. Attempting to reconnect...')
              // Attempt to reconnect
              pusherClient.connect()
            }
          }
        )

        onValue(
          roomRef,
          (snapshot) => {
            const messagesData = snapshot.val()
            if (messagesData) {
              const roomMessages = Object.values(messagesData)
                .filter((msg: any) => msg.roomId === roomId)
                .sort((a: any, b: any) => a.timestamp - b.timestamp)

              setMessages(roomMessages as Message[])
            } else {
              setMessages([])
            }
            setIsLoading(false)
            setError(null)
          },
          (error) => {
            console.error('Error fetching messages:', error)
            setError('Failed to fetch messages: ' + error.message)
            setIsLoading(false)
          }
        )

        // Save the room reference
        setCurrentRoomRef(roomId)
      } catch (err) {
        console.error('Error joining room:', err)
        setError(err instanceof Error ? err.message : 'Failed to join room')
        setIsLoading(false)
      }
    },
    [user]
  )

  const leaveRoom = useCallback(
    (roomId: string) => {
      if (currentRoomRef) {
        const roomRef = ref(realtimeDb, `messages/${currentRoomRef}`)
        off(roomRef)
        setCurrentRoomRef(null)
        setMessages([])
        console.log('Left room:', roomId)
      }
    },
    [currentRoomRef]
  )

  // Cleanup on unmount or user change
  useEffect(() => {
    return () => {
      if (currentRoomRef) {
        const roomRef = ref(realtimeDb, `messages/${currentRoomRef}`)
        off(roomRef)
        setCurrentRoomRef(null)
        setMessages([])
      }
    }
  }, [currentRoomRef, user])

  return (
    <ChatContext.Provider
      value={{
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
