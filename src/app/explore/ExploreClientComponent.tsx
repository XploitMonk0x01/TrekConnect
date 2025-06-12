
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, Star, Filter, Globe, Heart, Loader2, AlertTriangle, Route as RouteIcon, PlayCircle } from "lucide-react";
import type { Destination, UserProfile } from "@/lib/types";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";
import { searchPexelsImage } from "@/services/pexels"; // Pexels for images only now
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/services/users";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ExploreClientComponentProps {
  initialDestinations: Destination[];
}

type DestinationWithMedia = Destination & {
  isLoadingImage?: boolean;
  fetchedImageUrl?: string;
  isLoadingYouTubeUrl?: boolean; // New state for YouTube
  youtubeEmbedUrl?: string | null; // Store YouTube embed URL
};

export default function ExploreClientComponent({ initialDestinations }: ExploreClientComponentProps) {
  const { user: currentUser, isLoading: authIsLoading, updateUserInContext } = useCustomAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [destinations, setDestinations] = useState<DestinationWithMedia[]>(
    initialDestinations.map(d => ({
      ...d,
      isLoadingImage: true,
      fetchedImageUrl: d.imageUrl,
      isLoadingYouTubeUrl: true, // Initialize YouTube loading state
      youtubeEmbedUrl: null,
    }))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistProcessing, setWishlistProcessing] = useState<Record<string, boolean>>({});
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null); // For YouTube modal

  useEffect(() => {
    const fetchMedia = async () => {
      const destinationsWithFetchedMedia = await Promise.all(
        initialDestinations.map(async (dest) => {
          let pexelsImageUrl = dest.imageUrl || PLACEHOLDER_IMAGE_URL(600, 400);
          let isLoadingImg = true;
          const imageQuery = dest.aiHint || dest.name;
          try {
            pexelsImageUrl = await searchPexelsImage(imageQuery, 600, 400);
            isLoadingImg = false;
          } catch (error) {
            console.error(`Failed to load image for ${dest.name}:`, error);
            isLoadingImg = false; // Still set to false on error to stop skeleton
          }

          // Construct YouTube search embed URL
          const youtubeQuery = `${dest.name} ${dest.region || dest.country || ''} travel guide`;
          const constructedYoutubeEmbedUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(youtubeQuery)}`;

          return {
            ...dest,
            fetchedImageUrl: pexelsImageUrl,
            isLoadingImage: isLoadingImg,
            youtubeEmbedUrl: constructedYoutubeEmbedUrl, // Store the constructed URL
            isLoadingYouTubeUrl: false, // Set to false as we're constructing, not fetching API
          };
        })
      );
      setDestinations(destinationsWithFetchedMedia);
    };

    if (initialDestinations.length > 0) {
      fetchMedia();
      const firstDestinationWithCoords = initialDestinations.find(d => d.coordinates?.lat && d.coordinates?.lng);
      if (firstDestinationWithCoords && firstDestinationWithCoords.coordinates) {
        const { lat, lng } = firstDestinationWithCoords.coordinates;
        const zoomLevel = 0.5;
        setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${lng - zoomLevel}%2C${lat - zoomLevel}%2C${lng + zoomLevel}%2C${lat + zoomLevel}&layer=mapnik&marker=${lat}%2C${lng}`);
      } else {
        setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=68.0%2C25.0%2C97.0%2C35.0&layer=mapnik`);
      }
    } else {
      setDestinations([]);
      setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=68.0%2C25.0%2C97.0%2C35.0&layer=mapnik`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDestinations]);

  const filteredDestinations = destinations.filter(destination =>
    destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (destination.region && destination.region.toLowerCase().includes(searchQuery.toLowerCase())) ||
    destination.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleWishlist = async (destinationId: string, destinationName: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your wishlist.",
        action: <Button onClick={() => router.push('/auth/signin?redirect=/explore')}>Sign In</Button>,
      });
      return;
    }
    setWishlistProcessing(prev => ({ ...prev, [destinationId]: true }));

    const currentWishlist = currentUser.wishlistDestinations || [];
    const isWishlisted = currentWishlist.includes(destinationName);
    const newWishlist = isWishlisted
      ? currentWishlist.filter(name => name !== destinationName)
      : [...currentWishlist, destinationName];

    try {
      const updatedUser = await updateUserProfile(currentUser.id, { wishlistDestinations: newWishlist });
      if (updatedUser) {
        updateUserInContext(updatedUser as UserProfile);
        toast({
          title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
          description: `${destinationName} has been ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
        });
      } else {
        throw new Error("Failed to update wishlist on server.");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast({
        variant: "destructive",
        title: "Wishlist Update Failed",
        description: "Could not update your wishlist at this time. Please try again.",
      });
    } finally {
      setWishlistProcessing(prev => ({ ...prev, [destinationId]: false }));
    }
  };

  const isDestinationInWishlist = (destinationName: string): boolean => {
    if (!currentUser || !currentUser.wishlistDestinations) return false;
    return currentUser.wishlistDestinations.includes(destinationName);
  };

  const openVideoModal = (videoUrl: string) => {
    setSelectedVideoUrl(videoUrl);
  };

  const closeVideoModal = () => {
    setSelectedVideoUrl(null);
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Explore Indian Treks</CardTitle>
          <CardDescription>Find your next Himalayan adventure. Search for treks or browse our curated list.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search treks (e.g., Roopkund, Ladakh, Winter trek)"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" disabled>
              <Filter className="mr-2 h-4 w-4" /> Filters (Soon!)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Interactive Map of Indian Treks</CardTitle>
          <CardDescription>Visualize trek routes and plan your journey. (Powered by OpenStreetMap)</CardDescription>
        </CardHeader>
        <CardContent>
          {mapUrl ? (
            <iframe
              width="100%"
              height="400"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={mapUrl}
              className="rounded-lg border"
              title="Interactive Map of Treks"
              loading="lazy"
            ></iframe>
          ) : (
            <div className="h-96 w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              Loading map...
            </div>
          )}
        </CardContent>
      </Card>

      {(authIsLoading || destinations.some(d => d.isLoadingImage || d.isLoadingYouTubeUrl)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={`skeleton-${index}`} className="overflow-hidden flex flex-col">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 flex-grow">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="p-4 border-t grid grid-cols-3 gap-2 items-center">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!authIsLoading && filteredDestinations.length === 0 && !destinations.some(d => d.isLoadingImage || d.isLoadingYouTubeUrl) && (
         <Card>
            <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Treks Found</h3>
                <p className="text-muted-foreground">
                    {searchQuery ? "Try adjusting your search query." : "There are no treks available at the moment."}
                </p>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination) => (
          (destination.isLoadingImage || destination.isLoadingYouTubeUrl) ? ( // Check if still loading either
            <Card key={destination.id || Math.random().toString()} className="overflow-hidden flex flex-col">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 flex-grow">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="p-4 border-t grid grid-cols-3 gap-2 items-center">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ) : (
            filteredDestinations.find(fd => fd.id === destination.id) &&
            <Card key={destination.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="p-0 relative h-48">
                <Image
                  src={destination.fetchedImageUrl || PLACEHOLDER_IMAGE_URL(600,400)}
                  alt={destination.name}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={destination.aiHint || destination.name.toLowerCase().split(' ').slice(0,2).join(' ')}
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(600,400); }}
                />
                 <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white hover:text-pink-400 rounded-full"
                    onClick={() => handleToggleWishlist(destination.id, destination.name)}
                    disabled={wishlistProcessing[destination.id] || authIsLoading}
                    aria-label={isDestinationInWishlist(destination.name) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {wishlistProcessing[destination.id] ? <Loader2 className="h-5 w-5 animate-spin" /> :
                     <Heart className={`h-5 w-5 ${isDestinationInWishlist(destination.name) ? 'fill-pink-500 text-pink-500' : 'text-white'}`} />
                    }
                  </Button>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="font-headline text-lg mb-1">{destination.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {destination.country}{destination.region ? `, ${destination.region}` : ''}
                </div>
                <CardDescription className="text-sm line-clamp-3">{destination.description}</CardDescription>
              </CardContent>
              <CardFooter className="p-4 border-t grid grid-cols-2 sm:grid-cols-3 gap-2 items-center">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="text-sm font-semibold">{destination.averageRating}</span>
                </div>
                <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  <Link href={`/explore/${destination.id}`}>View Details</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="border-accent text-accent hover:bg-accent/5">
                  <Link href={`/explore/routes/new?destinationId=${destination.id}`}>
                    <RouteIcon className="mr-2 h-4 w-4" /> Plan Route
                  </Link>
                </Button>
                {destination.youtubeEmbedUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/5 sm:col-span-3" // Spans full width on small, then normal
                    onClick={() => openVideoModal(destination.youtubeEmbedUrl!)}
                  >
                    <PlayCircle className="mr-2 h-4 w-4" /> Watch Video
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        ))}
      </div>

      {selectedVideoUrl && (
        <Dialog open={!!selectedVideoUrl} onOpenChange={(isOpen) => !isOpen && closeVideoModal()}>
          <DialogContent className="max-w-3xl p-0">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle>Video Preview</DialogTitle>
            </DialogHeader>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={selectedVideoUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded-b-lg"
              ></iframe>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
