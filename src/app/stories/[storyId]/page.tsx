import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StoryCard } from "@/components/StoryCard";
import type { Story } from "@/lib/types";
import { ArrowLeft, BookOpen, MessageSquare, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

const mockStories: Story[] = [
  { id: "s1", userId: "u1", userName: "Alice", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40) + "?text=A", title: "My Everest Base Camp Adventure", content: "The trek to Everest Base Camp was one of the most challenging yet rewarding experiences of my life. From the bustling streets of Kathmandu to the serene heights of the Himalayas, every moment was filled with awe. We started our journey from Lukla, after a thrilling flight. The trails were dusty but the views were consistently breathtaking. Passing through Sherpa villages like Namche Bazaar, Tengboche, and Dingboche, we got a glimpse into their unique culture and resilience. Acclimatization days were crucial, and we took them seriously. The final push to Base Camp was tough, with the thin air making every step an effort. But standing there, surrounded by giants like Nuptse, Lhotse, and of course, Everest, was an indescribable feeling. The Khumbu Icefall looked menacingly beautiful. The return journey felt quicker, filled with reflections and a sense of pride. This trek tests you physically and mentally, but it's an experience that stays with you forever.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), destinationId: "1", destinationName: "Everest Base Camp", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 85, commentsCount: 12, tags: ["trekking", "Himalayas", "adventure", "high altitude"] },
  { id: "s2", userId: "u2", userName: "Bob", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40) + "?text=B", title: "Capturing Patagonia's Wild Beauty", content: "Patagonia is a photographer's dream. The landscapes are dramatic, the weather ever-changing, and the sense of solitude profound. I spent weeks hiking through Torres del Paine National Park and around El Chaltén, home to the iconic Fitz Roy massif. The colors at sunrise and sunset painting the granite towers were simply magical. Perito Moreno Glacier was another highlight, watching massive icebergs calve into Lago Argentino. The wind in Patagonia is relentless, a constant companion. But it adds to the wildness of the place. I carried all my gear, camping in remote spots to get the perfect shots. Wildlife was abundant too, from guanacos to condors. It's a challenging environment for photography, but the rewards are immense. Every image tells a story of raw, untamed nature.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), destinationId: "2", destinationName: "Patagonia Wilderness", createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 150, commentsCount: 25, tags: ["photography", "Patagonia", "nature", "hiking", "landscape"] },
];

const AITagsDetailedStories = {
    "s1": "everest base camp",
    "s2": "patagonia torres del paine"
};

interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatarUrl?: string;
    text: string;
    createdAt: string;
}

const mockComments: Comment[] = [
    { id: "c1", userId: "u3", userName: "Carol", userAvatarUrl: PLACEHOLDER_IMAGE_URL(32,32) + "?text=C", text: "Amazing story, Alice! Everest Base Camp is on my bucket list.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "c2", userId: "u4", userName: "David", userAvatarUrl: PLACEHOLDER_IMAGE_URL(32,32) + "?text=D", text: "Incredible photos, Bob! Patagonia looks stunning.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "c3", userId: "u1", userName: "Alice", userAvatarUrl: PLACEHOLDER_IMAGE_URL(32,32) + "?text=A", text: "Thanks for sharing, your pictures are inspiring!", createdAt: new Date(Date.now() - 1 * 12 * 60 * 60 * 1000).toISOString() },
];


export default function StoryDetailPage({ params }: { params: { storyId: string } }) {
  const story = mockStories.find(s => s.id === params.storyId);

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold">Story not found</h1>
        <p className="text-muted-foreground">The story you are looking for does not exist or has been moved.</p>
        <Button asChild className="mt-4">
          <Link href="/stories">Back to Stories</Link>
        </Button>
      </div>
    );
  }
  
  const storyComments = mockComments.filter(c => Math.random() > 0.5).slice(0,2); // Random comments for demo

  const storyWithAIHint = {
    ...story,
    imageUrl: story.imageUrl ? story.imageUrl + `?ai_hint=${AITagsDetailedStories[story.id as keyof typeof AITagsDetailedStories] || 'travel detail'}` : undefined
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

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Comments ({storyComments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={PLACEHOLDER_IMAGE_URL(36,36)+"?text=U"} alt="Your avatar" data-ai-hint="person avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea placeholder="Write a comment..." className="mb-2" />
              <Button size="sm">Post Comment</Button>
            </div>
          </div>
          {storyComments.length > 0 ? (
            storyComments.map(comment => (
              <div key={comment.id} className="flex items-start gap-3 pt-4 border-t">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={comment.userAvatarUrl || PLACEHOLDER_IMAGE_URL(36,36)+`?text=${comment.userName.charAt(0)}`} alt={comment.userName} data-ai-hint="person avatar"/>
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
                    <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-muted-foreground hover:text-primary">
                      <ThumbsUp className="h-3 w-3 mr-1" /> Like
                    </Button>
                     <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-muted-foreground hover:text-primary">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// export async function generateStaticParams() {
//   return mockStories.map((story) => ({
//     storyId: story.id,
//   }))
// }
