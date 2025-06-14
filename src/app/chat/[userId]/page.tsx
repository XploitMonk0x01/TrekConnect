'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useChat } from '@/contexts/ChatContext'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, ArrowLeft } from 'lucide-react'
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
  const { userId } = useParams()
  const {
    socket,
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    isLoading,
    error,
  } = useChat()
  const { user: currentUser } = useCustomAuth()
  const [messageInput, setMessageInput] = useState('')
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [roomId, setRoomId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (typeof userId === 'string') {
        try {
          setIsLoadingUser(true)
          const userData = await getUserProfile(userId)
          setOtherUser(userData)
        } catch (error) {
          console.error('Failed to fetch user profile:', error)
        } finally {
          setIsLoadingUser(false)
        }
      }
    }

    fetchOtherUser()
  }, [userId])

  useEffect(() => {
    if (typeof userId === 'string' && currentUser) {
      const newRoomId = generateRoomId(currentUser.id, userId)
      setRoomId(newRoomId)
    }
  }, [userId, currentUser])

  useEffect(() => {
    if (roomId && socket) {
      joinRoom(roomId)
      return () => leaveRoom(roomId)
    }
  }, [roomId, socket, joinRoom, leaveRoom])

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !roomId) return

    sendMessage(roomId, messageInput.trim())
    setMessageInput('')
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
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading || isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6">
          <CardContent>
            <p className="text-center text-muted-foreground">Loading chat...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
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
      <div className="border-b p-4 flex items-center gap-4">
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
              className="rounded-full"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(
                  40,
                  40
                )
              }}
            />
            <div>
              <h2 className="font-semibold">{otherUser.name}</h2>
              <p className="text-sm text-muted-foreground">
                {otherUser.location || 'Trekker'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === currentUser.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
