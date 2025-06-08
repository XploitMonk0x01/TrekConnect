
'use server';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StoryCard } from "@/components/StoryCard";
import type { Story } from "@/lib/types"; // Assuming Story type is defined
import { getStoryById } from "@/services/stories"; // Service to fetch story
import { ArrowLeft, BookOpen, MessageSquare, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

// Comment type can be moved to lib/types if used elsewhere
interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatarUrl?: string;
    text: string;
    createdAt: string;
}

// Mock comments are removed. In a real app, these would be fetched.
// const mockComments: Comment[] = []; 

export default async function StoryDetailPage({ params }: { params: { storyId: string } }) {
  const story = await getStoryById(params.storyId);

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold">Story not found</h1>
        <p className="text-muted-foreground">The story (ID: {params.storyId}) you are looking for does not exist or has been moved.</p>
        <Button asChild className="mt-4">
          <Link href="/stories">Back to Stories</Link>
        </Button>
      </div>
    );
  }
  
  // For now, comments are not fetched or displayed from DB.
  const storyComments: Comment[] = []; 

  // Enhance story with aiHint for images if necessary (assuming StoryCard handles it)
  const storyWithAIHint = {
    ...story,
    imageUrl: story.imageUrl ? `${story.imageUrl}${story.imageUrl.includes('?') ? '&' : '?'}ai_hint=${story.tags?.[0] || story.destinationName || story.title.substring(0,15)}` : undefined,
    userAvatarUrl: story.userAvatarUrl ? `${story.userAvatarUrl}${story.userAvatarUrl.includes('?') ? '&' : '?'}ai_hint=person ${story.userName.split(' ')[0]}` : `${PLACEHOLDER_IMAGE_URL(40,40)}?ai_hint=person ${story.userName.split(' ')[0]}`
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Button asChild variant="outline">
          <Link href="/stories">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stories
          </Link>
        </Button>
      </div>

      <StoryCard story={storyWithAIHint} isDetailedView={true} />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Comments ({storyComments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 border">
              {/* TODO: Get current user avatar */}
              <AvatarImage src={PLACEHOLDER_IMAGE_URL(36,36)} alt="Your avatar" data-ai-hint="person user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea placeholder="Write a comment... (Coming Soon)" className="mb-2" disabled />
              <Button size="sm" disabled>Post Comment</Button>
            </div>
          </div>
          {storyComments.length > 0 ? (
            storyComments.map(comment => (
              <div key={comment.id} className="flex items-start gap-3 pt-4 border-t">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={comment.userAvatarUrl || PLACEHOLDER_IMAGE_URL(36,36)} alt={comment.userName} data-ai-hint={`person ${comment.userName.split(' ')[0]}`}/>
                  <AvatarFallback>{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5">{comment.text}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-muted-foreground hover:text-primary" disabled>
                      <ThumbsUp className="h-3 w-3 mr-1" /> Like
                    </Button>
                     <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-muted-foreground hover:text-primary" disabled>
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Commenting feature coming soon!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
