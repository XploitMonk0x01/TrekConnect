
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhotoCard } from "@/components/PhotoCard";
import type { Photo } from "@/lib/types";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { getAllPhotos } from '@/services/photos'; // Import the service

export default async function PhotoFeedPage() {
  const photos: Photo[] = await getAllPhotos();

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
          <Button asChild className="mt-4 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/feed/upload">
              <UploadCloud className="mr-2 h-5 w-5" /> Upload Photo
            </Link>
          </Button>
        </CardHeader>
      </Card>

      {photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            // The PhotoCard component already handles extracting AI hints if they are part of the imageUrl/userAvatarUrl
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      ) : (
        <Card>
            <CardContent className="p-6 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Photo Feed is Empty</h3>
                <p className="text-muted-foreground">
                    No photos have been shared yet. Be the first to share your adventure or check back later!
                </p>
            </CardContent>
        </Card>
      )}
      
      {photos.length > 0 && (
        <div className="flex justify-center mt-8">
            <Button variant="outline">Load More Photos (Coming Soon)</Button>
        </div>
      )}
    </div>
  );
}
