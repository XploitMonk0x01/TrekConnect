
'use client'

import { useEffect, useState, useRef, FormEvent } from 'react'
import { useParams } from 'next/navigation'
import { useChat } from '@/contexts/ChatContext'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getUserProfileFromRTDB as getUserProfile } from '@/lib/auth'
import type { UserProfile } from '@/lib/types'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import Image from 'next/image'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Helper function to generate consistent room ID between two users
function generateRoomId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_')
}

export default function ChatPage() {
  const params = useParams();
  const otherUserIdFromParams = params.userId as string;

  const {
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    isLoading: chatContextIsLoading,
    isConnected,
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
          setOtherUser(null);
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
    if (currentUser && otherUser) {
      const newRoomId = generateRoomId(currentUser.id, otherUser.id)
      setRoomId(newRoomId)
    }
  }, [currentUser, otherUser])

  useEffect(() => {
    // **Fix**: This effect now correctly waits for both the roomId to be generated
    // and for the authentication to be complete before attempting to join the room.
    if (roomId && !authIsLoading) {
      joinRoom(roomId)
    }
    // The leaveRoom logic is now handled in the ChatContext on unmount or user change
  }, [roomId, authIsLoading, joinRoom])


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !roomId || !otherUser || !currentUser || !isConnected) return

    try {
        await sendMessage(roomId, messageInput.trim(), otherUser.id)
        setMessageInput('')
    } catch (error) {
        console.error("Error sending message from page:", error);
        // Toast is handled in context or service layer
    }
  }

  if (authIsLoading || isLoadingOtherUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading chat...</span>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
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
      <div className="flex items-center justify-center h-full">
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

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg shadow-sm">
      <div className="border-b p-4 flex items-center gap-4 flex-shrink-0">
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
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
       {(chatContextError || (!isConnected && !chatContextIsLoading)) && (
        <div className="p-4">
            <Alert variant={chatContextError ? "destructive" : "default"}>
                <AlertTitle>{chatContextError ? "Chat Connection Error" : "Chat Disconnected"}</AlertTitle>
                <AlertDescription>
                {chatContextError || "Connecting to chat..."}
                </AlertDescription>
            </Alert>
        </div>
      )}

        {chatContextIsLoading ? (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading messages...</p>
            </div>
        ) : messages.length === 0 ? (
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
                  {new Date(message.timestamp as number).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t p-4 bg-background/50 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting to chat..."}
            className="flex-1"
            disabled={!isConnected}
          />
          <Button type="submit" size="icon" disabled={!isConnected || !messageInput.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
