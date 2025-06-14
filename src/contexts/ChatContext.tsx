
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
  isConnected: boolean // New state to track connection status reliably
  messages: Message[]
  sendMessage: (roomId: string, content: string, receiverUserId: string) => void
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  isLoading: boolean
  error: string | null
}

const ChatContext = createContext<ChatContextType>({
  socket: null,
  isConnected: false, // Default to false
  messages: [],
  sendMessage: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  isLoading: true, // Start with isLoading true
  error: null,
})

export function ChatProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false) // State for connection status
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true) // Manages socket initialization loading
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
    // if (reason === "io server disconnect" || reason === "io client disconnect") {
      // setError("Chat disconnected. Please refresh or try again later.");
    // }
    // else the socket will automatically try to reconnect for other reasons
  }, [])

  const handleConnectError = useCallback((err: Error) => {
    console.error('ChatContext: Socket connection error:', err.message)
    setIsConnected(false)
    setError(`Chat connection failed: ${err.message}. It might be trying to reconnect.`)
  }, [])

  const handleReceiveMessage = useCallback((message: Message) => {
    console.log('ChatContext: Received message:', message)
    setMessages((prev) => [...prev, message])
  }, [])

  const handleLoadMessages = useCallback((loadedMessages: Message[]) => {
    console.log('ChatContext: Loaded messages:', loadedMessages)
    setMessages(loadedMessages)
  }, [])

  const handleErrorEvent = useCallback((errorMessage: string) => { // Renamed from handleError to avoid conflict
    console.error('ChatContext: Socket error event received:', errorMessage)
    setError(errorMessage)
    // Depending on the error, you might want to set isConnected to false
  }, [])


  useEffect(() => {
    const initializeSocket = async () => {
      if (!user) {
        console.log('ChatContext: User not authenticated, skipping socket initialization.')
        if (socketRef.current) {
            socketRef.current.disconnect()
            socketRef.current = null
            setSocket(null)
        }
        setIsConnected(false)
        setIsLoading(false) // No user, so not loading socket
        return
      }

      // Prevent re-initialization if socket already exists and is connected for the current user
      if (socketRef.current && socketRef.current.connected && socketRef.current.auth?.userId === user.id) {
        console.log('ChatContext: Socket already connected for this user.');
        setIsConnected(true); // Ensure isConnected reflects this
        setIsLoading(false);
        return;
      }
      
      if (socketRef.current) {
        console.log('ChatContext: Disconnecting existing socket before new initialization.');
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      setIsLoading(true)
      setError(null)
      setIsConnected(false) 
      console.log('ChatContext: Initializing new socket connection...')
      
      try {
        // Ensure the API route for socket.io server setup is available
        await fetch('/api/socket').catch(err => console.warn("ChatContext: Pre-fetch to /api/socket failed, continuing with socket connection attempt.", err));

        const socketInstance = io({
          path: '/api/socket',
          addTrailingSlash: false,
          auth: {
            userId: user.id,
          },
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 20000,
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
        // Note: isConnected will be set by the 'connect' event handler.
      } catch (e) {
        console.error('ChatContext: Failed to initialize socket object:', e)
        setError('Failed to initialize chat communications.')
        if (socketRef.current) {
            socketRef.current.disconnect(); // Clean up if partial setup
            socketRef.current = null;
        }
        setSocket(null)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
        console.log('ChatContext: initializeSocket finished. isLoading:', isLoading, 'isConnected:', isConnected);
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
        setSocket(null);
        setIsConnected(false);
      } else {
        console.log("ChatContext: Cleanup called but no socketRef.current.");
      }
    }
  }, [user, handleConnect, handleDisconnect, handleConnectError, handleReceiveMessage, handleLoadMessages, handleErrorEvent, isLoading, isConnected]) // Added isLoading, isConnected to dependencies


  const sendMessage = useCallback(
    (roomId: string, content: string, receiverUserId: string) => {
      if (!socketRef.current || !user || !isConnected) { // Check isConnected here
        console.error('Socket not connected, user not authenticated, or socket not ready to send message.')
        setError('Cannot send message: Chat not connected.');
        return
      }
      console.log('ChatContext: Sending message:', { roomId, content, userId: user.id, receiverUserId })
      const message: Message = {
        id: Math.random().toString(36).substring(7), 
        roomId,
        senderId: user.id,
        receiverId: receiverUserId,
        content,
        timestamp: new Date(),
        read: false,
      }
      socketRef.current.emit('send-message', { roomId, message })
    },
    [user, isConnected, setError] // Added isConnected and setError
  )

  const joinRoom = useCallback(
    (roomId: string) => {
      if (!socketRef.current || !user || !isConnected) { // Check isConnected
        console.error('Socket not connected or user not authenticated for joinRoom')
        return
      }
      console.log('ChatContext: Joining room:', roomId)
      setMessages([]) 
      socketRef.current.emit('join-room', roomId)
    },
    [user, isConnected] // Added isConnected
  )

  const leaveRoom = useCallback((roomId: string) => {
    if (!socketRef.current || !isConnected) { // Check isConnected
      console.error('Socket not connected for leaveRoom')
      return
    }
    console.log('ChatContext: Leaving room:', roomId)
    socketRef.current.emit('leave-room', roomId)
    setMessages([])
  }, [isConnected]) // Added isConnected

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

    