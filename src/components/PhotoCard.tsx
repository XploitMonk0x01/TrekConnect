'use client'

import { useState } from 'react'
import CachedImage from './CachedImage'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Photo } from '@/lib/types'
import {
  Heart,
  MessageCircle,
  MapPin,
  CalendarDays,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { togglePhotoLike } from '@/services/photos'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { useToast } from '@/hooks/use-toast'

interface PhotoCardProps {
  photo: Photo
}

export function PhotoCard({ photo }: PhotoCardProps) {
  const { user } = useCustomAuth()
  const { toast } = useToast()
  const [likesCount, setLikesCount] = useState(photo.likesCount || 0)
  const [isLiked, setIsLiked] = useState(
    user ? (photo.likes || []).includes(user.id) : false
  )
  const [isLiking, setIsLiking] = useState(false)

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like photos.',
        variant: 'destructive',
      })
      return
    }

    setIsLiking(true)
    // Optimistic update
    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))

    try {
      const result = await togglePhotoLike(photo.id, user.id)
      if (result) {
        setLikesCount(result.likesCount)
        setIsLiked(result.isLiked)
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(isLiked)
      setLikesCount(photo.likesCount || 0)
      toast({
        title: 'Error',
        description: 'Failed to update like. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLiking(false)
    }
  }
  // Extract AI hint from imageUrl if it's appended with ?ai_hint=...
  let imageUrl = photo.imageUrl
  let imageAiHint = 'travel landscape' // Default hint
  if (photo.imageUrl.includes('?ai_hint=')) {
    const parts = photo.imageUrl.split('?ai_hint=')
    imageUrl = parts[0]
    if (parts[1]) {
      imageAiHint = decodeURIComponent(parts[1])
    }
  }

  let avatarUrl =
    photo.userAvatarUrl ||
    `${PLACEHOLDER_IMAGE_URL(40, 40)}?ai_hint=person ${photo.userName.charAt(
      0
    )}`
  let avatarAiHint = `person ${photo.userName.charAt(0)}`
  if (photo.userAvatarUrl && photo.userAvatarUrl.includes('?ai_hint=')) {
    const parts = photo.userAvatarUrl.split('?ai_hint=')
    avatarUrl = parts[0]
    if (parts[1]) {
      avatarAiHint = decodeURIComponent(parts[1])
    }
  }

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Avatar className="h-10 w-10 border">
          <AvatarImage
            src={avatarUrl}
            alt={photo.userName}
            data-ai-hint={avatarAiHint}
          />
          <AvatarFallback>
            {photo.userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5">
          <Link
            href={`/profile/${photo.userId}`}
            className="font-semibold hover:underline"
          >
            {photo.userName}
          </Link>
          {photo.destinationName && (
            <div className="text-xs text-muted-foreground flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <Link
                href={`/explore/${photo.destinationId || ''}`}
                className="hover:underline"
              >
                {photo.destinationName}
              </Link>
            </div>
          )}
        </div>
      </CardHeader>
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={photo.caption || `Photo by ${photo.userName}`}
          fill
          className="object-cover"
          data-ai-hint={imageAiHint}
        />
      </div>
      <CardContent className="p-4">
        {photo.caption && (
          <p className="text-sm text-foreground/90 mb-2 line-clamp-2">
            {photo.caption}
          </p>
        )}
        <div className="text-xs text-muted-foreground flex items-center">
          <CalendarDays className="h-3 w-3 mr-1" />
          {formatDistanceToNow(new Date(photo.uploadedAt), { addSuffix: true })}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t flex items-center justify-start gap-4">
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
        <button className="flex items-center text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="h-5 w-5 mr-1" />
          <span>{photo.commentsCount || 0}</span>
        </button>
      </CardFooter>
    </Card>
  )
}
