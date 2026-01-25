'use client'

import { useState } from 'react'
import CachedImage from './CachedImage'
import Link from 'next/link'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Story } from '@/lib/types'
import {
  CalendarDays,
  MessageCircle,
  Heart,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { toggleStoryLike } from '@/services/stories'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { useToast } from '@/hooks/use-toast'

interface StoryCardProps {
  story: Story
  isDetailedView?: boolean
}

export function StoryCard({ story, isDetailedView = false }: StoryCardProps) {
  const { user } = useCustomAuth()
  const { toast } = useToast()
  const [likesCount, setLikesCount] = useState(story.likesCount || 0)
  const [isLiked, setIsLiked] = useState(
    user ? (story.likes || []).includes(user.id) : false
  )
  const [isLiking, setIsLiking] = useState(false)

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like stories.',
        variant: 'destructive',
      })
      return
    }

    setIsLiking(true)
    // Optimistic update
    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))

    try {
      const result = await toggleStoryLike(story.id, user.id)
      if (result) {
        setLikesCount(result.likesCount)
        setIsLiked(result.isLiked)
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(isLiked)
      setLikesCount(story.likesCount || 0)
      toast({
        title: 'Error',
        description: 'Failed to update like. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLiking(false)
    }
  }

  let imageUrl = story.imageUrl
  let imageAiHint = 'travel story'
  if (story.imageUrl && story.imageUrl.includes('?ai_hint=')) {
    const parts = story.imageUrl.split('?ai_hint=')
    imageUrl = parts[0]
    if (parts[1]) {
      imageAiHint = decodeURIComponent(parts[1])
    }
  }

  let avatarUrl =
    story.userAvatarUrl ||
    `${PLACEHOLDER_IMAGE_URL(40, 40)}?ai_hint=person ${story.userName.charAt(
      0
    )}`
  let avatarAiHint = `person ${story.userName.charAt(0)}`
  if (story.userAvatarUrl && story.userAvatarUrl.includes('?ai_hint=')) {
    const parts = story.userAvatarUrl.split('?ai_hint=')
    avatarUrl = parts[0]
    if (parts[1]) {
      avatarAiHint = decodeURIComponent(parts[1])
    }
  }

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {imageUrl && (
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={story.title}
            fill
            className="object-cover"
            data-ai-hint={imageAiHint}
          />
        </div>
      )}
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Avatar className="h-10 w-10 border">
          <AvatarImage
            src={avatarUrl}
            alt={story.userName}
            data-ai-hint={avatarAiHint}
          />
          <AvatarFallback>
            {story.userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5">
          <Link
            href={`/profile/${story.userId}`}
            className="font-semibold hover:underline"
          >
            {story.userName}
          </Link>
          <div className="text-xs text-muted-foreground flex items-center">
            <CalendarDays className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(story.createdAt), {
              addSuffix: true,
            })}
            {story.updatedAt &&
              story.updatedAt !== story.createdAt &&
              ` (edited ${formatDistanceToNow(new Date(story.updatedAt), {
                addSuffix: true,
              })})`}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-2">
          <Link
            href={`/stories/${story.id}`}
            className="hover:text-primary transition-colors"
          >
            {story.title}
          </Link>
        </CardTitle>
        {story.destinationName && (
          <Badge variant="secondary" className="mb-2">
            Destination: {story.destinationName}
          </Badge>
        )}
        <CardDescription
          className={
            isDetailedView
              ? 'prose dark:prose-invert max-w-none'
              : 'line-clamp-4 text-foreground/80'
          }
        >
          {isDetailedView
            ? story.content
            : story.content.substring(0, 200) +
              (story.content.length > 200 ? '...' : '')}
        </CardDescription>
        {story.tags && story.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLikeToggle}
            disabled={isLiking}
            className={`flex items-center transition-colors ${
              isLiked
                ? 'text-red-500 hover:text-red-600'
                : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            {isLiking ? (
              <Loader2 className="h-5 w-5 mr-1 animate-spin" />
            ) : (
              <Heart
                className={`h-5 w-5 mr-1 ${isLiked ? 'fill-current' : ''}`}
              />
            )}
            <span>{likesCount}</span>
          </button>
          <Link
            href={`/stories/${story.id}#comments`}
            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="h-5 w-5 mr-1" />
            <span>{story.commentsCount || 0}</span>
          </Link>
        </div>
        {!isDetailedView && (
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5"
          >
            <Link href={`/stories/${story.id}`}>
              Read More <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
