
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/StoryCard";
import type { Story } from "@/lib/types";
import { Edit, BookOpen } from "lucide-react";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

const mockStories: Story[] = [
  { id: "s1_in", userId: "u1", userName: "Aanya", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40), title: "Journey to the Mysterious Roopkund Lake", content: "The Roopkund trek in Uttarakhand was an unforgettable journey into the heart of the Himalayas. We navigated through dense forests, expansive meadows (bugyals), and challenging snowy paths to reach the enigmatic skeletal lake...", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), destinationId: "in1", destinationName: "Roopkund Trek", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 95, commentsCount: 15, tags: ["uttarakhand", "roopkund", "mystery", "high altitude"] },
  { id: "s2_in", userId: "u2", userName: "Rohan", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40), title: "Hampta Pass: A Himalayan Crossover Adventure", content: "Crossing Hampta Pass in Himachal Pradesh felt like stepping into another world. The lush green Kullu valley on one side, and the stark, beautiful desert landscapes of Lahaul on the other. Camping at Shea Goru was a highlight...", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), destinationId: "in2", destinationName: "Hampta Pass Trek", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 130, commentsCount: 22, tags: ["himachal", "hampta pass", "adventure", "crossover"] },
  { id: "s3_in", userId: "u3", userName: "Mira", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40), title: "Winter Magic on the Kedarkantha Trek", content: "My first winter trek to Kedarkantha in Uttarakhand was simply magical. Walking on fresh snow, the crisp mountain air, and the 360-degree views of Himalayan giants from the summit were breathtaking. Juda-ka-Talab campsite was surreal...", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), destinationId: "in4", destinationName: "Kedarkantha Trek", createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 110, commentsCount: 19, tags: ["winter trek", "kedarkantha", "uttarakhand", "snow"] },
];

const AITagsStories = ["uttarakhand himalayas", "himachal mountains", "winter snow trek"];


export default function TravelStoriesPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-headline text-3xl text-primary flex items-center">
              <BookOpen className="mr-3 h-8 w-8" /> Indian Trek Stories
            </CardTitle>
            <CardDescription>Read inspiring tales from the Indian Himalayas and share your own adventures.</CardDescription>
          </div>
          <Button className="mt-4 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Edit className="mr-2 h-5 w-5" /> Write Your Story
          </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStories.map((story, index) => (
          <StoryCard key={story.id} story={{...story, imageUrl: story.imageUrl ? `${story.imageUrl}?ai_hint=${AITagsStories[index % AITagsStories.length]}` : undefined, userAvatarUrl: `${story.userAvatarUrl}?ai_hint=person ${story.userName}` }} />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button variant="outline">Load More Stories</Button>
      </div>
    </div>
  );
}
