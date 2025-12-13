'use server'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { StoryCard } from '@/components/StoryCard'
import type { Story } from '@/lib/types'
import { getStoryById } from '@/services/stories'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { CommentsSection } from '@/components/CommentsSection'

export default async function Page({
  params,
}: {
  params: Promise<{ storyId: string }>
}) {
  const { storyId } = await params
  const story = await getStoryById(storyId)

  if (!story) {
    return (
      <div className="container mx-auto max-w-7xl flex flex-col items-center justify-center h-full text-center p-6">
        <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold">Story not found</h1>
        <p className="text-muted-foreground">
          The story (ID: {storyId}) you are looking for does not exist or has
          been moved.
        </p>
        <Button asChild className="mt-4">
          <Link href="/stories">Back to Stories</Link>
        </Button>
      </div>
    )
  }

  // Enhance story with aiHint for images if necessary
  const storyWithAIHint = {
    ...story,
    imageUrl: story.imageUrl
      ? `${story.imageUrl}${story.imageUrl.includes('?') ? '&' : '?'}ai_hint=${
          story.tags?.[0] ||
          story.destinationName ||
          story.title.substring(0, 15)
        }`
      : undefined,
    userAvatarUrl: story.userAvatarUrl
      ? `${story.userAvatarUrl}${
          story.userAvatarUrl.includes('?') ? '&' : '?'
        }ai_hint=person ${story.userName.split(' ')[0]}`
      : `${PLACEHOLDER_IMAGE_URL(40, 40)}?ai_hint=person ${
          story.userName.split(' ')[0]
        }`,
  }

  return (
    <div className="space-y-8 container mx-auto max-w-3xl">
      <div className="flex items-center">
        <Button asChild variant="outline">
          <Link href="/stories">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stories
          </Link>
        </Button>
      </div>

      <StoryCard story={storyWithAIHint} isDetailedView={true} />

      <CommentsSection
        parentId={storyId}
        parentType="story"
        initialCommentsCount={story.commentsCount || 0}
      />
    </div>
  )
}
