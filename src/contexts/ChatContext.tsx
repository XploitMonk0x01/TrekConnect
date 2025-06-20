
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import { io, Socket } from 'socket.io-client'
import { useCustomAuth } from './CustomAuthContext'
import type { Message } from '@/lib/types'

interface ChatContextType {
  socket: Socket | null
  isConnected: boolean
  messages: Message[]
  sendMessage: (roomId: string, content: string, receiverUserId: string) => void
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  isLoading: boolean // For initial socket connection attempt
  error: string | null
}

const ChatContext = createContext<ChatContextType>({
  socket: null,
  isConnected: false,
  messages: [],
  sendMessage: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  isLoading: true,
  error: null,
})

export function ChatProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useCustomAuth()
  const socketRef = useRef<Socket | null>(null)

  const handleConnect = useCallback(() => {
    console.log('ChatContext: Socket connected!', socketRef.current?.id)
    setIsConnected(true)
    setError(null)
  }, [])

  const handleDisconnect = useCallback((reason: Socket.DisconnectReason) => {
    console.log('ChatContext: Socket disconnected.', reason)
    setIsConnected(false)
    if (reason === "io server disconnect" || reason === "io client disconnect") {
      setError("Chat disconnected. Please refresh or try again later.");
    }
    // For other reasons, the socket might attempt to reconnect automatically.
  }, [])

  const handleConnectError = useCallback((err: Error) => {
    console.error('ChatContext: Socket connection error:', err.message)
    setIsConnected(false)
    setError(`Chat connection failed: ${err.message}. Retrying...`)
  }, [])

  const handleReceiveMessage = useCallback((message: Message) => {
    console.log('ChatContext: Received message:', message)
    setMessages((prev) => [...prev, message])
  }, [])

  const handleLoadMessages = useCallback((loadedMessages: Message[]) => {
    console.log('ChatContext: Loaded messages:', loadedMessages)
    setMessages(loadedMessages)
  }, [])

  const handleErrorEvent = useCallback((errorMessage: string) => {
    console.error('ChatContext: Socket error event received:', errorMessage)
    setError(errorMessage)
    setIsConnected(false); // Assume critical error if server sends this
  }, [])


  useEffect(() => {
    const initializeSocket = async () => {
      if (!user) {
        console.log('ChatContext: User not authenticated, skipping socket initialization.')
        if (socketRef.current) {
            socketRef.current.disconnect()
            setSocket(null) // Clear state
            socketRef.current = null
        }
        setIsConnected(false)
        setIsLoading(false)
        return
      }

      if (socketRef.current && socketRef.current.connected && socketRef.current.auth?.userId === user.id) {
        console.log('ChatContext: Socket already connected for this user.');
        setIsConnected(true);
        setIsLoading(false);
        return;
      }
      
      if (socketRef.current) {
        console.log('ChatContext: Disconnecting existing socket before new initialization for new user or retry.');
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      setIsLoading(true)
      setError(null)
      setIsConnected(false) 
      console.log('ChatContext: Initializing new socket connection...')
      
      try {
        await fetch('/api/socket').catch(err => console.warn("ChatContext: Pre-fetch to /api/socket failed (this is okay if server is not up yet).", err));

        const socketInstance = io({
          path: '/api/socket',
          addTrailingSlash: false,
          auth: { userId: user.id },
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          timeout: 10000,
        })
        console.log('ChatContext: Socket instance created, attempting to connect.');

        socketInstance.on('connect', handleConnect)
        socketInstance.on('disconnect', handleDisconnect)
        socketInstance.on('connect_error', handleConnectError)
        socketInstance.on('receive-message', handleReceiveMessage)
        socketInstance.on('load-messages', handleLoadMessages)
        socketInstance.on('error', handleErrorEvent)

        socketRef.current = socketInstance
        setSocket(socketInstance)
      } catch (e: any) {
        console.error('ChatContext: Failed to initialize socket object:', e)
        setError(`Failed to initialize chat: ${e.message}`)
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setSocket(null)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSocket()

    return () => {
      if (socketRef.current) {
        const oldSocketId = socketRef.current.id;
        console.log(`ChatContext: Cleaning up socket ${oldSocketId}...`);
        socketRef.current.off('connect', handleConnect);
        socketRef.current.off('disconnect', handleDisconnect);
        socketRef.current.off('connect_error', handleConnectError);
        socketRef.current.off('receive-message', handleReceiveMessage);
        socketRef.current.off('load-messages', handleLoadMessages);
        socketRef.current.off('error', handleErrorEvent);
        
        if (socketRef.current.connected) {
            console.log(`ChatContext: Disconnecting active socket ${oldSocketId}.`);
            socketRef.current.disconnect();
        } else {
            console.log(`ChatContext: Socket ${oldSocketId} was not connected during cleanup, removing listeners.`);
        }
        socketRef.current = null;
        setSocket(null); // Clear from state
        setIsConnected(false);
      }
    }
  // Dependency array refined to primarily react to user changes for re-initialization.
  // Callbacks are memoized, so they shouldn't cause re-runs unless their own dependencies change.
  }, [user, handleConnect, handleDisconnect, handleConnectError, handleReceiveMessage, handleLoadMessages, handleErrorEvent])


  const sendMessage = useCallback(
    (roomId: string, content: string, receiverUserId: string) => {
      if (!socketRef.current || !user || !isConnected) {
        console.error('Socket not connected or user not authenticated, cannot send message.')
        setError('Cannot send message: Chat not connected.');
        return
      }
      console.log('ChatContext: Sending message:', { roomId, content, senderId: user.id, receiverUserId })
      const message: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Client-generated temp ID
        roomId,
        senderId: user.id,
        receiverId: receiverUserId,
        content,
        timestamp: new Date(),
        read: false,
      }
      socketRef.current.emit('send-message', { roomId, message })
      // Optimistically add to local messages if desired, or wait for server broadcast
      // setMessages((prev) => [...prev, message]); // Example of optimistic update
    },
    [user, isConnected, setError]
  )

  const joinRoom = useCallback(
    (roomId: string) => {
      if (!socketRef.current || !user || !isConnected) {
        console.error('Socket not connected or user not authenticated for joinRoom')
        return
      }
      console.log('ChatContext: Joining room:', roomId)
      setMessages([]) 
      socketRef.current.emit('join-room', roomId)
    },
    [user, isConnected]
  )

  const leaveRoom = useCallback((roomId: string) => {
    if (!socketRef.current || !isConnected) {
      console.error('Socket not connected for leaveRoom')
      return
    }
    console.log('ChatContext: Leaving room:', roomId)
    socketRef.current.emit('leave-room', roomId)
    setMessages([])
  }, [isConnected])

  return (
    <ChatContext.Provider
      value={{
        socket,
        isConnected,
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
