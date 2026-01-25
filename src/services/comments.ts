import {
  ref,
  set,
  get,
  push,
  query,
  orderByChild,
  equalTo,
  update,
} from 'firebase/database'
import { realtimeDb } from '@/lib/firebase'
import type { Comment, CreateCommentInput } from '@/lib/types'

const COMMENTS_PATH = 'comments'

// Create a new comment
export async function createComment(
  commentInput: CreateCommentInput
): Promise<Comment> {
  try {
    const commentsRef = ref(realtimeDb, COMMENTS_PATH)
    const newCommentRef = push(commentsRef)
    const newCommentId = newCommentRef.key

    if (!newCommentId) {
      throw new Error('Could not generate a new comment ID.')
    }

    const newComment: Comment = {
      id: newCommentId,
      parentId: commentInput.parentId,
      parentType: commentInput.parentType,
      userId: commentInput.userId,
      userName: commentInput.userName,
      userAvatarUrl: commentInput.userAvatarUrl || null,
      content: commentInput.content,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      likes: [],
    }

    await set(newCommentRef, newComment)

    // Update the parent's commentsCount
    const parentPath =
      commentInput.parentType === 'story'
        ? `stories/${commentInput.parentId}`
        : `photos/${commentInput.parentId}`
    const parentRef = ref(realtimeDb, parentPath)
    const parentSnapshot = await get(parentRef)

    if (parentSnapshot.exists()) {
      const parent = parentSnapshot.val()
      await update(parentRef, {
        commentsCount: (parent.commentsCount || 0) + 1,
      })
    }

    return newComment
  } catch (error) {
    console.error('Error creating comment in Firebase:', error)
    throw new Error('Failed to create comment.')
  }
}

// Get all comments for a story or photo
export async function getCommentsByParent(
  parentId: string,
  parentType: 'story' | 'photo'
): Promise<Comment[]> {
  try {
    const commentsRef = ref(realtimeDb, COMMENTS_PATH)
    const commentsQuery = query(
      commentsRef,
      orderByChild('parentId'),
      equalTo(parentId)
    )
    const snapshot = await get(commentsQuery)

    if (snapshot.exists()) {
      const commentsData = snapshot.val()
      // Filter by parentType and sort by createdAt descending
      return Object.values<Comment>(commentsData)
        .filter((c) => c.parentType === parentType)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }
    return []
  } catch (error) {
    console.error(
      `Error getting comments for ${parentType} ${parentId}:`,
      error
    )
    return []
  }
}

// Delete a comment
export async function deleteComment(
  commentId: string,
  userId: string
): Promise<void> {
  try {
    const commentRef = ref(realtimeDb, `${COMMENTS_PATH}/${commentId}`)
    const snapshot = await get(commentRef)

    if (!snapshot.exists()) {
      throw new Error('Comment not found.')
    }

    const comment = snapshot.val() as Comment

    if (comment.userId !== userId) {
      throw new Error('Not authorized to delete this comment.')
    }

    // Delete the comment
    await set(commentRef, null)

    // Update the parent's commentsCount
    const parentPath =
      comment.parentType === 'story'
        ? `stories/${comment.parentId}`
        : `photos/${comment.parentId}`
    const parentRef = ref(realtimeDb, parentPath)
    const parentSnapshot = await get(parentRef)

    if (parentSnapshot.exists()) {
      const parent = parentSnapshot.val()
      await update(parentRef, {
        commentsCount: Math.max((parent.commentsCount || 1) - 1, 0),
      })
    }
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error)
    throw new Error('Failed to delete comment.')
  }
}

// Toggle like on a comment
export async function toggleCommentLike(
  commentId: string,
  userId: string
): Promise<{ likesCount: number; likes: string[]; isLiked: boolean } | null> {
  try {
    const commentRef = ref(realtimeDb, `${COMMENTS_PATH}/${commentId}`)
    const snapshot = await get(commentRef)

    if (!snapshot.exists()) {
      return null
    }

    const comment = snapshot.val() as Comment
    const currentLikes = comment.likes || []
    const isCurrentlyLiked = currentLikes.includes(userId)

    let newLikes: string[]
    if (isCurrentlyLiked) {
      newLikes = currentLikes.filter((id) => id !== userId)
    } else {
      newLikes = [...currentLikes, userId]
    }

    const newLikesCount = newLikes.length

    await update(commentRef, {
      likes: newLikes,
      likesCount: newLikesCount,
    })

    return {
      likesCount: newLikesCount,
      likes: newLikes,
      isLiked: !isCurrentlyLiked,
    }
  } catch (error) {
    console.error(`Error toggling like on comment ${commentId}:`, error)
    throw new Error('Failed to toggle comment like.')
  }
}
