
'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useChat } from '@/contexts/ChatContext'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getUserProfile } from '@/services/users'
import type { UserProfile } from '@/lib/types'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import Image from 'next/image'

// Helper function to generate consistent room ID between two users
function generateRoomId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_')
}

export default function ChatPage() {
  const params = useParams();
  const otherUserIdFromParams = params.userId as string; // The ID of the user being chatted with

  const {
    socket,
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    isLoading: chatContextIsLoading,
    error: chatContextError,
  } = useChat()
  const { user: currentUser, isLoading: authIsLoading } = useCustomAuth()
  const [messageInput, setMessageInput] = useState('')
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoadingOtherUser, setIsLoadingOtherUser] = useState(true)
  const [roomId, setRoomId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (otherUserIdFromParams) {
        try {
          setIsLoadingOtherUser(true)
          const userData = await getUserProfile(otherUserIdFromParams)
          setOtherUser(userData)
        } catch (error) {
          console.error('Failed to fetch other user profile:', error)
          setOtherUser(null); // Explicitly set to null on error
        } finally {
          setIsLoadingOtherUser(false)
        }
      } else {
        setIsLoadingOtherUser(false);
        setOtherUser(null);
      }
    }

    fetchOtherUser()
  }, [otherUserIdFromParams])

  useEffect(() => {
    if (currentUser && otherUserIdFromParams) {
      const newRoomId = generateRoomId(currentUser.id, otherUserIdFromParams)
      setRoomId(newRoomId)
    }
  }, [currentUser, otherUserIdFromParams])

  useEffect(() => {
    if (roomId && socket && socket.connected) {
      joinRoom(roomId)
      return () => {
        if (socket.connected) { // Check if socket is still connected before leaving
          leaveRoom(roomId)
        }
      }
    }
  }, [roomId, socket, joinRoom, leaveRoom])


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !roomId || !otherUser || !currentUser) return

    sendMessage(roomId, messageInput.trim(), otherUser.id) // Pass otherUser.id as receiverUserId
    setMessageInput('')
  }

  if (authIsLoading || isLoadingOtherUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading chat participant...</span>
      </div>
    )
  }
  
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to access the chat.
            </p>
            <Button asChild>
              <Link href={`/auth/signin?redirect=/chat/${otherUserIdFromParams}`}>Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!otherUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <CardTitle>User Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Could not load the profile of the user you're trying to chat with.
            </p>
            <Button asChild>
              <Link href="/connect">Return to Connect</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }


  if (chatContextIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Connecting to chat...</span>
      </div>
    )
  }

  if (chatContextError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <CardTitle>Chat Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{chatContextError}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mr-2">
              Try Again
            </Button>
            <Button asChild>
              <Link href="/connect">Return to Connect</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4 flex items-center gap-4 sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/connect">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        {otherUser && (
          <div className="flex items-center gap-3">
            <Image
              src={otherUser.photoUrl || PLACEHOLDER_IMAGE_URL(40, 40)}
              alt={otherUser.name || 'User'}
              width={40}
              height={40}
              className="rounded-full object-cover"
              data-ai-hint={`person ${otherUser.name?.split(' ')[0] || 'chat'}`}
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(
                  40,
                  40
                )
              }}
            />
            <div>
              <h2 className="font-semibold">{otherUser.name}</h2>
              {/* Removed .location as it's not a standard field */}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-16"> {/* Added mb-16 for space for input bar */}
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === currentUser.id
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 shadow-md ${
                  message.senderId === currentUser.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t p-4 bg-background fixed bottom-0 left-0 right-0 md:ml-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar-wrapper:md:ml-[var(--sidebar-width)] transition-[margin-left] duration-200 ease-linear">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!socket || !socket.connected}
          />
          <Button type="submit" size="icon" disabled={!socket || !socket.connected || !messageInput.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
