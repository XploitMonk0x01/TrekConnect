
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
  const [isLoading, setIsLoading] = useState(true) // Tracks initial connection attempt
  const [error, setError] = useState<string | null>(null)
  const { user } = useCustomAuth()
  const socketRef = useRef<Socket | null>(null)

  const handleConnect = useCallback(() => {
    console.log('ChatContext: Socket connected!', socketRef.current?.id)
    setIsConnected(true)
    setError(null)
    setIsLoading(false); // Connected, so no longer initially loading
  }, [])

  const handleDisconnect = useCallback((reason: Socket.DisconnectReason) => {
    console.log('ChatContext: Socket disconnected.', reason)
    setIsConnected(false)
    // No longer setting isLoading to true on disconnect, as it's for initial load
    if (reason === "io server disconnect" || reason === "io client disconnect" || reason === "transport error") {
      setError("Chat disconnected. Please refresh or try again later.");
    } else {
      setError("Chat connection lost. Attempting to reconnect...");
    }
  }, [])

  const handleConnectError = useCallback((err: Error) => {
    console.error('ChatContext: Socket connection error:', err.message)
    setIsConnected(false)
    setError(`Chat connection failed: ${err.message}. Retrying...`)
    setIsLoading(false); // Connection attempt (even if failed) is over for initial load
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
    setIsConnected(false);
  }, [])


  useEffect(() => {
    if (!user) {
      console.log('ChatContext: User not authenticated, cleaning up existing socket if any.')
      if (socketRef.current) {
          socketRef.current.disconnect()
          socketRef.current = null
      }
      setSocket(null)
      setIsConnected(false)
      setIsLoading(false) // Not loading if no user
      setError(null)
      return
    }

    // If socket exists and is for the current user, do nothing.
    if (socketRef.current && socketRef.current.auth?.userId === user.id && socketRef.current.connected) {
      console.log('ChatContext: Socket already connected for this user.');
      setIsConnected(true);
      setIsLoading(false); // Already loaded
      setError(null);
      return;
    }
    
    // If socket exists but for a different user or disconnected, clean it up.
    if (socketRef.current) {
      console.log('ChatContext: Cleaning up old socket instance before new initialization.');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log('ChatContext: Initializing new socket connection for user:', user.id);
    setIsLoading(true); // Start loading for new connection attempt
    setError(null);
    setIsConnected(false);
    
    // The client directly attempts to connect.
    // The server-side logic at /api/socket should handle the Socket.IO server setup.
    const socketInstance = io({
      path: '/api/socket',
      addTrailingSlash: false,
      auth: { userId: user.id },
      reconnectionAttempts: 5,
      reconnectionDelay: 3000, // Increased delay
      timeout: 10000,
    });
    console.log('ChatContext: Socket instance created, attempting to connect.');

    socketInstance.on('connect', handleConnect)
    socketInstance.on('disconnect', handleDisconnect)
    socketInstance.on('connect_error', handleConnectError)
    socketInstance.on('receive-message', handleReceiveMessage)
    socketInstance.on('load-messages', handleLoadMessages)
    socketInstance.on('error', handleErrorEvent) // Generic error handler from server

    socketRef.current = socketInstance
    setSocket(socketInstance)
    
    // setIsLoading(false) will be handled by connect/connect_error handlers

    return () => {
      if (socketInstance) {
        console.log(`ChatContext: Cleaning up socket ${socketInstance.id} on component unmount or user change.`);
        socketInstance.off('connect', handleConnect);
        socketInstance.off('disconnect', handleDisconnect);
        socketInstance.off('connect_error', handleConnectError);
        socketInstance.off('receive-message', handleReceiveMessage);
        socketInstance.off('load-messages', handleLoadMessages);
        socketInstance.off('error', handleErrorEvent);
        socketInstance.disconnect();
      }
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      // Reset loading state if user changes and causes cleanup, next effect run will set it.
      if(user) setIsLoading(true); else setIsLoading(false);
    }
  }, [user, handleConnect, handleDisconnect, handleConnectError, handleReceiveMessage, handleLoadMessages, handleErrorEvent]);


  const sendMessage = useCallback(
    (roomId: string, content: string, receiverUserId: string) => {
      if (!socketRef.current || !user || !isConnected) {
        console.error('Socket not connected or user not authenticated, cannot send message.')
        setError('Cannot send message: Chat not connected.');
        return
      }
      console.log('ChatContext: Sending message:', { roomId, content, senderId: user.id, receiverUserId })
      const message: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        roomId,
        senderId: user.id,
        receiverId: receiverUserId, // Correctly using receiverUserId
        content,
        timestamp: new Date(),
        read: false,
      }
      socketRef.current.emit('send-message', { roomId, message })
    },
    [user, isConnected, setError] // Added setError to dependencies
  )

  const joinRoom = useCallback(
    (roomId: string) => {
      if (!socketRef.current || !user || !isConnected) {
        console.error('Socket not connected or user not authenticated for joinRoom')
        setError('Cannot join room: Chat not connected.');
        return
      }
      console.log('ChatContext: Joining room:', roomId)
      setMessages([]) 
      socketRef.current.emit('join-room', roomId)
    },
    [user, isConnected, setError] // Added setError
  )

  const leaveRoom = useCallback((roomId: string) => {
    if (!socketRef.current || !isConnected) { // Check isConnected directly
      console.error('Socket not connected for leaveRoom')
      setError('Cannot leave room: Chat not connected.');
      return
    }
    console.log('ChatContext: Leaving room:', roomId)
    socketRef.current.emit('leave-room', roomId)
    setMessages([])
  }, [isConnected, setError]) // Added isConnected, setError

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
