'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useChat } from '@/contexts/ChatContext'
import { useCustomAuth } from '@/contexts/CustomAuthContext'

function generateRoomId(userA: string, userB: string) {
  return [userA, userB].sort().join('_')
}

export default function ChatPage() {
  const { userId: otherUserId } = useParams() as { userId: string }
  const { user: currentUser } = useCustomAuth()
  const { messages, sendMessage, joinRoom, leaveRoom, isConnected } = useChat()
  const [input, setInput] = useState('')
  const roomId =
    currentUser && otherUserId
      ? generateRoomId(currentUser.id, otherUserId)
      : null

  useEffect(() => {
    if (roomId) joinRoom(roomId)
    return () => {
      if (roomId) leaveRoom(roomId)
    }
  }, [roomId, joinRoom, leaveRoom])

  const handleSend = () => {
    if (roomId && input.trim() && currentUser && otherUserId) {
      sendMessage(roomId, input.trim(), otherUserId)
      setInput('')
    }
  }

  // ...render messages and input box...
}
