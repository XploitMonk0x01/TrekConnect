
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhotoCard } from "@/components/PhotoCard";
import type { Photo } from "@/lib/types";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

const mockPhotos: Photo[] = [
  { id: "p1", userId: "u1", userName: "Priya", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40), imageUrl: PLACEHOLDER_IMAGE_URL(600,600), destinationId: "in1", destinationName: "Roopkund Trek", caption: "Lost in the mystery of Roopkund. What an adventure!", uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 135, commentsCount: 18 },
  { id: "p2", userId: "u2", userName: "Arjun", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40), imageUrl: PLACEHOLDER_IMAGE_URL(600,600), destinationId: "in2", destinationName: "Hampta Pass Trek", caption: "The crossover from Kullu to Lahaul at Hampta Pass was breathtaking.", uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 210, commentsCount: 25 },
  { id: "p3", userId: "u3", userName: "Sneha", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40), imageUrl: PLACEHOLDER_IMAGE_URL(600,600), destinationId: "in3", destinationName: "Valley of Flowers", caption: "A carpet of flowers as far as the eye can see. Magical Uttarakhand!", uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 190, commentsCount: 20 },
  { id: "p4", userId: "u1", userName: "Priya", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40), imageUrl: PLACEHOLDER_IMAGE_URL(600,600), destinationId: "in4", destinationName: "Kedarkantha Trek", caption: "Snowy trails and majestic peaks on the Kedarkantha summit.", uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 175, commentsCount: 28 },
  { id: "p5", userId: "u4", userName: "Vikram", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40), imageUrl: PLACEHOLDER_IMAGE_URL(600,600), destinationId: "in5", destinationName: "Triund Trek", caption: "Weekend well spent at Triund. The Dhauladhars are stunning!", uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 160, commentsCount: 15 },
  { id: "p6", userId: "u2", userName: "Arjun", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40), imageUrl: PLACEHOLDER_IMAGE_URL(600,600), destinationId: "in6", destinationName: "Kashmir Great Lakes", caption: "Emerald lakes and pristine meadows. Kashmir is truly heaven.", uploadedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 280, commentsCount: 35 },
];

const AITagsFeed = ["roopkund lake", "hampta pass himachal", "valley flowers uttarakhand", "kedarkantha snow", "triund dhauladhar", "kashmir alpine lakes"];

export default function PhotoFeedPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-headline text-3xl text-primary flex items-center">
              <ImageIcon className="mr-3 h-8 w-8" /> Photo Feed
            </CardTitle>
            <CardDescription>Share your Indian trek adventures and get inspired by the community.</CardDescription>
          </div>
          <Button className="mt-4 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground">
            <UploadCloud className="mr-2 h-5 w-5" /> Upload Photo
          </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPhotos.map((photo, index) => (
          <PhotoCard key={photo.id} photo={{...photo, imageUrl: `${photo.imageUrl}?ai_hint=${AITagsFeed[index % AITagsFeed.length]}`, userAvatarUrl: `${photo.userAvatarUrl}?ai_hint=person ${photo.userName}`}} />
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button variant="outline">Load More Photos</Button>
      </div>
    </div>
  );
}
