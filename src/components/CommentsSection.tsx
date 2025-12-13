'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { useToast } from '@/hooks/use-toast'
import type { Comment } from '@/lib/types'
import {
  createComment,
  getCommentsByParent,
  deleteComment,
  toggleCommentLike,
} from '@/services/comments'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { ThumbsUp, Trash2, Loader2, MessageSquare, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface CommentsSectionProps {
  parentId: string
  parentType: 'story' | 'photo'
  initialCommentsCount: number
}

export function CommentsSection({
  parentId,
  parentType,
  initialCommentsCount,
}: CommentsSectionProps) {
  const { user } = useCustomAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchComments() {
      try {
        const fetchedComments = await getCommentsByParent(parentId, parentType)
        setComments(fetchedComments)
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchComments()
  }, [parentId, parentType])

  const handlePostComment = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to post comments.',
        variant: 'destructive',
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: 'Empty comment',
        description: 'Please write something before posting.',
        variant: 'destructive',
      })
      return
    }

    setIsPosting(true)
    try {
      const comment = await createComment({
        parentId,
        parentType,
        content: newComment.trim(),
        userId: user.id,
        userName: user.name || 'Anonymous',
        userAvatarUrl: user.photoUrl,
      })
      setComments((prev) => [comment, ...prev])
      setNewComment('')
      toast({
        title: 'Comment posted!',
        description: 'Your comment has been added.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsPosting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return

    setDeletingIds((prev) => new Set(prev).add(commentId))
    try {
      await deleteComment(commentId, user.id)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast({
        title: 'Comment deleted',
        description: 'Your comment has been removed.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment.',
        variant: 'destructive',
      })
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(commentId)
        return next
      })
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like comments.',
        variant: 'destructive',
      })
      return
    }

    setLikingIds((prev) => new Set(prev).add(commentId))
    try {
      const result = await toggleCommentLike(commentId, user.id)
      if (result) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, likesCount: result.likesCount, likes: result.likes }
              : c
          )
        )
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to like comment.',
        variant: 'destructive',
      })
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev)
        next.delete(commentId)
        return next
      })
    }
  }

  const isCommentLiked = (comment: Comment) => {
    return user ? (comment.likes || []).includes(user.id) : false
  }

  return (
    <Card id="comments">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment input */}
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarImage
              src={user?.photoUrl || PLACEHOLDER_IMAGE_URL(36, 36)}
              alt="Your avatar"
            />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder={
                user ? 'Write a comment...' : 'Sign in to comment...'
              }
              className="mb-2 min-h-[80px]"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!user || isPosting}
            />
            <Button
              size="sm"
              onClick={handlePostComment}
              disabled={!user || isPosting || !newComment.trim()}
            >
              {isPosting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Post Comment
            </Button>
          </div>
        </div>

        {/* Comments list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-3 pt-4 border-t"
            >
              <Avatar className="h-9 w-9 border">
                <AvatarImage
                  src={comment.userAvatarUrl || PLACEHOLDER_IMAGE_URL(36, 36)}
                  alt={comment.userName}
                />
                <AvatarFallback>
                  {comment.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/profile/${comment.userId}`}
                    className="font-semibold text-sm hover:underline"
                  >
                    {comment.userName}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 mt-1">
                  {comment.content}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-auto p-1 text-xs ${
                      isCommentLiked(comment)
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                    onClick={() => handleLikeComment(comment.id)}
                    disabled={likingIds.has(comment.id)}
                  >
                    {likingIds.has(comment.id) ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <ThumbsUp
                        className={`h-3 w-3 mr-1 ${
                          isCommentLiked(comment) ? 'fill-current' : ''
                        }`}
                      />
                    )}
                    {comment.likesCount || 0}
                  </Button>
                  {user && user.id === comment.userId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingIds.has(comment.id)}
                    >
                      {deletingIds.has(comment.id) ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3 mr-1" />
                      )}
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
