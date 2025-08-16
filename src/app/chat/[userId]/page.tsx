'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useChat } from '@/contexts/ChatContext'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send, ArrowLeft, Loader2, Smile, Phone, Video, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { getUserProfileFromRTDB as getUserProfile } from '@/lib/auth'
import type { UserProfile } from '@/lib/types'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import Image from 'next/image'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Common emojis for quick access
const QUICK_EMOJIS = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊',
  '😍', '🥰', '😘', '😗', '😙', '😋', '😛', '🤔',
  '🤗', '🤩', '😎', '🙂', '😐', '😑', '😶', '🙄',
  '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫',
  '🥱', '😴', '😌', '😛', '😜', '😝', '🤤', '😒',
  '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁',
  '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧',
  '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶',
  '😳', '🤪', '😵', '🥴', '😠', '😡', '🤬', '😷',
  '🤒', '🤕', '🤢', '🤮', '🤧', '🥳', '🥺', '🤠',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
  '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚',
  '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
  '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️'
]

// Helper function to generate consistent room ID between two users
function generateRoomId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_')
}

// Format Firebase/ISO timestamps safely (supports number, string, or object with seconds/nanoseconds)
function formatMessageTime(ts: unknown): string {
  try {
    let d: Date | null = null
    if (typeof ts === 'number') {
      d = new Date(ts)
    } else if (typeof ts === 'string') {
      d = new Date(ts)
    } else if (ts && typeof ts === 'object') {
      const anyTs = ts as any
      if (typeof anyTs.seconds === 'number') {
        const millis =
          anyTs.seconds * 1000 +
          Math.floor((anyTs.nanoseconds || 0) / 1_000_000)
        d = new Date(millis)
      }
    }
    return d
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : ''
  } catch {
    return ''
  }
}

export default function ChatPage() {
  const params = useParams()
  const otherUserIdFromParams = params.userId as string

  const {
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    markAsRead,
    isLoading: chatContextIsLoading,
    isConnected,
    error: chatContextError,
  } = useChat()
  const { user: currentUser, isLoading: authIsLoading } = useCustomAuth()
  const [messageInput, setMessageInput] = useState('')
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoadingOtherUser, setIsLoadingOtherUser] = useState(true)
  const [roomId, setRoomId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!otherUserIdFromParams) {
        setIsLoadingOtherUser(false)
        setOtherUser(null)
        return
      }

      // Try instant prefill from sessionStorage for fast room join
      if (typeof window !== 'undefined') {
        const prefillRaw = sessionStorage.getItem(
          `chat_prefill_${otherUserIdFromParams}`
        )
        if (prefillRaw) {
          try {
            const prefill = JSON.parse(prefillRaw) as Partial<UserProfile>
            if (prefill && prefill.id) {
              setOtherUser({
                id: prefill.id as string,
                name: (prefill.name as string) || 'User',
                photoUrl: (prefill.photoUrl as string) || undefined,
                email: '',
              } as UserProfile)
              setIsLoadingOtherUser(false)
            }
          } catch {}
        }
      }

      // Always fetch in background to ensure latest info
      try {
        const userData = await getUserProfile(otherUserIdFromParams)
        setOtherUser(userData)
      } catch (error) {
        console.error('Failed to fetch other user profile:', error)
      } finally {
        setIsLoadingOtherUser(false)
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
    // Ensure we create/get the room before listening by passing safe defaults
    if (roomId && !authIsLoading && otherUser) {
      const safeName = otherUser.name || 'User'
      const safePhoto = otherUser.photoUrl || undefined
      joinRoom(roomId, otherUser.id, safeName, safePhoto)
    }
    // The leaveRoom logic is now handled in the ChatContext on unmount or user change
  }, [roomId, authIsLoading, otherUser, joinRoom])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (
      !messageInput.trim() ||
      !roomId ||
      !otherUser ||
      !currentUser ||
      !isConnected
    ) {
      return
    }

    try {
      const safeName = otherUser.name || 'User'
      const safePhoto = otherUser.photoUrl || undefined
      await sendMessage(
        roomId,
        messageInput.trim(),
        otherUser.id,
        safeName,
        safePhoto
      )
      setMessageInput('')
      setShowEmojiPicker(false) // Close emoji picker after sending
    } catch (error) {
      console.error('Error sending message from page:', error)
      // Toast is handled in context or service layer
    }
  }

  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessageInput(prev => prev + emoji)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)
    
    // Simple typing indicator logic
    if (!isTyping) {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 2000)
    }
  }, [isTyping])

  if (authIsLoading || (isLoadingOtherUser && !otherUser)) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading Chat...</p>
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
              <Link
                href={`/auth/signin?redirect=/chat/${otherUserIdFromParams}`}
              >
                Sign In
              </Link>
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-background to-accent/5">
      {/* Modern Chat Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto max-w-7xl flex h-16 items-center gap-4 px-4 sm:px-6">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent/20">
            <Link href="/connect">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          {otherUser && (
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage
                    src={otherUser.photoUrl || PLACEHOLDER_IMAGE_URL(40, 40)}
                    alt={otherUser.name || 'User'}
                    data-ai-hint={`person ${
                      otherUser.name?.split(' ')[0] || 'user'
                    }`}
                  />
                  <AvatarFallback>
                    {(otherUser.name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-semibold font-headline text-foreground">
                  {otherUser.name || 'User'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {isConnected ? (isTyping ? 'Typing...' : 'Online') : 'Connecting...'}
                </p>
              </div>
            </div>
          )}

          {/* Chat Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-accent/20">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-accent/20">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent/20">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Block User</DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Chat Content Area */}
      <div className="flex-1 container mx-auto max-w-7xl flex flex-col overflow-hidden p-4">
        <div className="flex flex-col bg-card border rounded-xl shadow-lg w-full flex-1 xl:max-w-5xl xl:self-center overflow-hidden">
          
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 md:p-6">
            <div className="space-y-4">
              {(chatContextError || (!isConnected && !chatContextIsLoading)) && (
                <Alert variant={chatContextError ? 'destructive' : 'default'} className="mx-auto max-w-md">
                  <AlertTitle>
                    {chatContextError ? 'Connection Error' : 'Disconnected'}
                  </AlertTitle>
                  <AlertDescription>
                    {chatContextError || 'Reconnecting to chat...'}
                  </AlertDescription>
                </Alert>
              )}

              {chatContextIsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.senderId === currentUser?.id
                  const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId)
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwn && (
                        <div className="w-8 flex-shrink-0">
                          {showAvatar && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={otherUser?.photoUrl || PLACEHOLDER_IMAGE_URL(32, 32)}
                                alt={otherUser?.name || 'User'}
                              />
                              <AvatarFallback className="text-xs">
                                {(otherUser?.name || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}
                      
                      <div className={`max-w-[70%] sm:max-w-[60%] md:max-w-[50%] lg:max-w-[45%] ${isOwn ? 'ml-auto' : ''}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md ${
                            isOwn
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted text-foreground rounded-bl-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                            {message.content}
                          </p>
                        </div>
                        <p className={`text-xs text-muted-foreground mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                          {formatMessageTime(message.timestamp as unknown)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input Area */}
          <div className="border-t bg-background/50 p-4 md:p-6">
            <div className="flex items-end gap-3">
              {/* Emoji Picker */}
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 hover:bg-accent/20"
                    disabled={!isConnected}
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3 border shadow-lg" side="top" align="start">
                  <div className="max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-8 gap-1">
                      {QUICK_EMOJIS.map((emoji, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-accent/20 text-lg"
                          onClick={() => {
                            handleEmojiSelect(emoji)
                            setShowEmojiPicker(false)
                          }}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Message Input */}
              <div className="flex-1 relative">
                <Input
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void handleSendMessage()
                    }
                  }}
                  placeholder={
                    isConnected ? 'Type a message...' : 'Connecting...'
                  }
                  className="h-11 pr-12 resize-none border-2 focus:border-primary/50 transition-colors"
                  disabled={!isConnected}
                />
              </div>

              {/* Send Button */}
              <Button
                type="button"
                size="icon"
                disabled={!isConnected || !messageInput.trim()}
                onClick={() => void handleSendMessage()}
                className="shrink-0 h-11 w-11 rounded-full bg-primary hover:bg-primary/90 transition-all hover:scale-105"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
