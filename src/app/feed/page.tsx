import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhotoCard } from "@/components/PhotoCard";
import type { Photo } from "@/lib/types";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

const mockPhotos: Photo[] = [
  { id: "p1", userId: "u1", userName: "Alice", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40) + "?text=A", imageUrl: PLACEHOLDER_IMAGE_URL(600,600), destinationId: "1", destinationName: "Everest Base Camp", caption: "Sunrise over the Himalayas. Unforgettable!", uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 120, commentsCount: 15 },
  { id: "p2", userId: "u2", userName: "Bob", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40) + "?text=B", imageUrl: PLACEHOLDER_IMAGE_URL(600,600), destinationId: "2", destinationName: "Patagonia Wilderness", caption: "Torres del Paine in its full glory.", uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 250, commentsCount: 30 },
  { id: "p3", userId: "u3", userName: "Carol", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40) + "?text=C", imageUrl: PLACEHOLDER_IMAGE_URL(600,600), destinationId: "3", destinationName: "Kyoto Temples", caption: "Peaceful morning at Kinkaku-ji.", uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 90, commentsCount: 5 },
  { id: "p4", userId: "u1", userName: "Alice", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40) + "?text=A", imageUrl: PLACEHOLDER_IMAGE_URL(600,600), destinationId: "4", destinationName: "Serengeti Safari", caption: "Majestic lion in the Serengeti.", uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 180, commentsCount: 22 },
  { id: "p5", userId: "u4", userName: "David", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40) + "?text=D", imageUrl: PLACEHOLDER_IMAGE_URL(600,600), destinationId: "5", destinationName: "Rome Ancient Ruins", caption: "The Colosseum at dusk.", uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 150, commentsCount: 18 },
  { id: "p6", userId: "u2", userName: "Bob", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40) + "?text=B", imageUrl: PLACEHOLDER_IMAGE_URL(600,600), destinationId: "6", destinationName: "Banff National Park", caption: "Lake Louise reflections.", uploadedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 300, commentsCount: 40 },
];

const AITagsFeed = ["himalayas landscape", "patagonia mountains", "japan temple", "safari lion", "rome colosseum", "canada lake"];

export default function PhotoFeedPage() {
  // Add data-ai-hint to images in PhotoCard if not already there
  // For mockPhotos, they use PLACEHOLDER_IMAGE_URL which is fine.
  // If PhotoCard itself takes a data-ai-hint prop, that would be better.
  // For now, just ensure the PhotoCard's Image has a generic hint.
  // The PhotoCard has data-ai-hint="travel landscape" which is good.

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-headline text-3xl text-primary flex items-center">
              <ImageIcon className="mr-3 h-8 w-8" /> Photo Feed
            </CardTitle>
            <CardDescription>Share your adventures and get inspired by the community.</CardDescription>
          </div>
          <Button className="mt-4 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground">
            <UploadCloud className="mr-2 h-5 w-5" /> Upload Photo
          </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPhotos.map((photo, index) => (
          // Pass AI hint to PhotoCard or modify PhotoCard to accept it based on photo content
          // For now, PhotoCard itself has a generic hint. Specific hints could be added if PhotoCard is modified.
          <PhotoCard key={photo.id} photo={{...photo, imageUrl: PLACEHOLDER_IMAGE_URL(600,600) + `?ai_hint=${AITagsFeed[index % AITagsFeed.length]}`}} />
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button variant="outline">Load More Photos</Button>
      </div>
    </div>
  );
}
