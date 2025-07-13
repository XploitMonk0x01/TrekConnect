import { useEffect, useState } from 'react'
import { initSocket, getSocket, disconnectSocket } from '@/lib/socket'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { Message } from '@/lib/types'

export default function Chat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const { user } = useCustomAuth()

  useEffect(() => {
    if (!user?.id) {
      setError('Authentication required for chat')
      return
    }

    try {
      // Initialize socket with user authentication
      const socket = initSocket(user.id)

      // Connect manually after setting up all listeners
      socket.connect()

      // Socket event listeners
      socket.on('connect', () => {
        setError(null)
        console.log('Connected to chat server')
      })

      socket.on('receive-message', (msg: Message) => {
        setMessages((prev) => [...prev, msg])
      })

      socket.on('connect_error', (err) => {
        setError(`Connection error: ${err.message}`)
        console.error('Chat connection error:', err.message)
      })

      socket.on('error', (err: string) => {
        setError(`Server error: ${err}`)
        console.error('Chat server error:', err)
      })

      // Cleanup on unmount
      return () => {
        disconnectSocket()
      }
    } catch (err) {
      setError(
        `Failed to initialize chat: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      )
      console.error('Chat initialization error:', err)
    }
  }, [user?.id])

  const sendMessage = () => {
    if (!message.trim() || !user?.id) return

    try {
      const socket = getSocket()
      const newMessage: Partial<Message> = {
        content: message.trim(),
        senderId: user.id,
        timestamp: new Date(),
      }

      socket.emit('send-message', {
        roomId: 'global', // You can make this dynamic based on your needs
        message: newMessage,
      })

      setMessage('') // Clear input field
    } catch (err) {
      setError(
        `Failed to send message: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      )
      console.error('Failed to send message:', err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="space-y-2">
          {messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`p-2 rounded-lg ${
                msg.senderId === user?.id
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'bg-gray-200 text-gray-900 mr-auto'
              } max-w-[80%]`}
            >
              <p className="break-words">{msg.content}</p>
              <span className="text-xs opacity-75">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!user?.id || !!error}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || !user?.id || !!error}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
