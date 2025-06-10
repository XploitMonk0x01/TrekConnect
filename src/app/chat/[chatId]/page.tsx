
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Added CardFooter
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Loader2, UserCircle, AlertTriangle } from 'lucide-react';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { getUserProfile } from '@/services/users';
import type { UserProfile } from '@/lib/types';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

// Mock message type - in a real app, this would come from your DB/real-time service
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isLoading: authIsLoading } = useCustomAuth();
  const chatId = params.chatId as string; // This is the ID of the other user

  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [isLoadingOtherUser, setIsLoadingOtherUser] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]); // Placeholder for messages
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (chatId) {
      setIsLoadingOtherUser(true);
      getUserProfile(chatId)
        .then(profile => {
          setOtherUser(profile);
        })
        .catch(error => {
          console.error("Failed to fetch other user's profile:", error);
          setOtherUser(null); // Set to null on error
        })
        .finally(() => {
          setIsLoadingOtherUser(false);
        });
    } else {
        setIsLoadingOtherUser(false);
    }
  }, [chatId]);

  // Placeholder for fetching/subscribing to messages
  useEffect(() => {
    if (currentUser && otherUser) {
      // console.log(`Setting up chat between ${currentUser.id} and ${otherUser.id}`);
      // In a real app, you would fetch existing messages and subscribe to new ones here.
      // For now, we'll just use a placeholder message.
      setMessages([
        { id: '1', senderId: otherUser.id, text: `Hello ${currentUser.name}! This is a placeholder chat.`, timestamp: new Date() }
      ]);
    }
  }, [currentUser, otherUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !otherUser) return;

    setIsSending(true);
    // In a real app, this would send the message to your backend/real-time service
    // For now, just add to local state as a placeholder
    const sentMessage: Message = {
      id: Math.random().toString(),
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, sentMessage]);
    setNewMessage('');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSending(false);
  };

  if (authIsLoading || isLoadingOtherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <CardTitle className="text-2xl mb-2">Access Denied</CardTitle>
        <CardDescription className="mb-6">You need to be signed in to view chats.</CardDescription>
        <Button asChild>
          <Link href={`/auth/signin?redirect=/chat/${chatId}`}>Sign In</Link>
        </Button>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <UserCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <CardTitle className="text-2xl mb-2">User Not Found</CardTitle>
        <CardDescription className="mb-6">Could not load profile for this chat.</CardDescription>
        <Button asChild variant="outline">
          <Link href="/connect">Back to ConnectSphere</Link>
        </Button>
      </div>
    );
  }

  const getAvatarFallback = (name?: string | null): string => {
    if (name) return name.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center gap-4 p-4 border-b sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={otherUser.photoUrl || PLACEHOLDER_IMAGE_URL(40,40)} alt={otherUser.name || 'User'} data-ai-hint={`person ${otherUser.name?.split(' ')[0] || 'user'}`} />
          <AvatarFallback>{getAvatarFallback(otherUser.name)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg font-semibold">{otherUser.name || 'Chat User'}</CardTitle>
          <CardDescription className="text-xs">Chat (Coming Soon)</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
            <p className="font-bold">Feature Under Development</p>
            <p>Real-time chat functionality is coming soon! This is a placeholder UI.</p>
        </div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.senderId === currentUser.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.senderId === currentUser.id ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter className="p-4 border-t sticky bottom-0 bg-background">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message... (Feature coming soon)"
            rows={1}
            className="resize-none flex-1"
            disabled // Disabled until real-time backend is implemented
          />
          <Button type="submit" size="icon" disabled={isSending || true}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </div>
  );
}

    