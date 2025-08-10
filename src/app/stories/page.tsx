
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/StoryCard";
import type { Story } from "@/lib/types";
import { Edit, BookOpen } from "lucide-react";
import { getAllStories } from "@/services/stories"; // Import service

export default async function TravelStoriesPage() {
  const stories: Story[] = await getAllStories();

  // Simple AI hint generation for story cards, can be more sophisticated
  const generateStoryAiHint = (story: Story, index: number): string => {
    if (story.tags && story.tags.length > 0) return story.tags.slice(0, 2).join(' ');
    if (story.destinationName) return story.destinationName.toLowerCase().split(' ').slice(0,2).join(' ');
    return `travel story ${index + 1}`;
  };
   const generateAvatarAiHint = (userName: string): string => {
    return `person ${userName?.split(' ')[0] || 'author'}`;
  };


  return (
    <div className="space-y-8 container mx-auto max-w-7xl">
      <Card className="shadow-lg">
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-headline text-3xl text-primary flex items-center">
              <BookOpen className="mr-3 h-8 w-8" /> Indian Trek Stories
            </CardTitle>
            <CardDescription>Read inspiring tales from the Indian Himalayas and share your own adventures.</CardDescription>
          </div>
          <Button asChild className="mt-4 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/stories/new">
                <Edit className="mr-2 h-5 w-5" /> Write Your Story
            </Link>
          </Button>
        </CardHeader>
      </Card>

      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, index) => {
            // Add AI hints for images within StoryCard
            const storyWithAIHints = {
              ...story,
              imageUrl: story.imageUrl ? `${story.imageUrl}${story.imageUrl.includes('?') ? '&' : '?'}ai_hint=${generateStoryAiHint(story, index)}` : undefined,
              userAvatarUrl: story.userAvatarUrl ? `${story.userAvatarUrl}${story.userAvatarUrl.includes('?') ? '&' : '?'}ai_hint=${generateAvatarAiHint(story.userName)}` : undefined,
            };
            return <StoryCard key={story.id} story={storyWithAIHints} />;
          })}
        </div>
      ) : (
         <Card>
            <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Stories Yet</h3>
                <p className="text-muted-foreground">
                    Be the first to share your trekking adventure or check back later for new stories!
                </p>
            </CardContent>
        </Card>
      )}
      
      {stories.length > 0 && (
        <div className="flex justify-center mt-8">
            <Button variant="outline" disabled>Load More Stories (Coming Soon)</Button>
        </div>
      )}
    </div>
  );
}
