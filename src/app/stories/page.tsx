import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/StoryCard";
import type { Story } from "@/lib/types";
import { Edit, BookOpen } from "lucide-react";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

const mockStories: Story[] = [
  { id: "s1", userId: "u1", userName: "Alice", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40) + "?text=A", title: "My Everest Base Camp Adventure", content: "The trek to Everest Base Camp was one of the most challenging yet rewarding experiences of my life. From the bustling streets of Kathmandu to the serene heights of the Himalayas, every moment was filled with awe...", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), destinationId: "1", destinationName: "Everest Base Camp", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 85, commentsCount: 12, tags: ["trekking", "Himalayas", "adventure"] },
  { id: "s2", userId: "u2", userName: "Bob", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40) + "?text=B", title: "Capturing Patagonia's Wild Beauty", content: "Patagonia is a photographer's dream. The landscapes are dramatic, the weather ever-changing, and the sense of solitude profound. I spent weeks hiking through Torres del Paine and El Chaltén, capturing moments I'll never forget...", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), destinationId: "2", destinationName: "Patagonia Wilderness", createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 150, commentsCount: 25, tags: ["photography", "Patagonia", "nature"] },
  { id: "s3", userId: "u3", userName: "Carol", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40) + "?text=C", title: "First Time Trekking in the Alps", content: "As a beginner trekker, I was a bit nervous about the Alps, but it turned out to be an amazing experience! We chose a moderate trail with stunning views, and the support from our group was fantastic. Highly recommend it for anyone starting out.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), destinationName: "Swiss Alps", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 60, commentsCount: 8, tags: ["beginner", "Alps", "group travel"] },
];

const AITagsStories = ["mountains snow", "patagonia landscape", "alps hiking"];


export default function TravelStoriesPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-headline text-3xl text-primary flex items-center">
              <BookOpen className="mr-3 h-8 w-8" /> Travel Stories
            </CardTitle>
            <CardDescription>Read inspiring tales and share your own adventures with the community.</CardDescription>
          </div>
          <Button className="mt-4 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Edit className="mr-2 h-5 w-5" /> Write Your Story
          </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStories.map((story, index) => (
          <StoryCard key={story.id} story={{...story, imageUrl: story.imageUrl ? story.imageUrl + `?ai_hint=${AITagsStories[index % AITagsStories.length]}` : undefined }} />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button variant="outline">Load More Stories</Button>
      </div>
    </div>
  );
}
