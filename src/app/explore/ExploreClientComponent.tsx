
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, Star, Filter, Globe } from "lucide-react";
import type { Destination } from "@/lib/types";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";
import { searchPexelsImage } from "@/services/pexels"; // Assuming this service exists
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ExploreClientComponentProps {
  initialDestinations: Destination[];
}

// Define a new type that includes isLoadingImage
type DestinationWithLoading = Destination & { isLoadingImage?: boolean };

export default function ExploreClientComponent({ initialDestinations }: ExploreClientComponentProps) {
  const [destinations, setDestinations] = useState<DestinationWithLoading[]>(
    initialDestinations.map(d => ({ ...d, imageUrl: d.imageUrl || PLACEHOLDER_IMAGE_URL(600, 400), isLoadingImage: true }))
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      const destinationsWithFetchedImages = await Promise.all(
        initialDestinations.map(async (dest) => {
          const query = dest.aiHint || dest.name; // Use aiHint from DB, fallback to name
          try {
            const pexelsImageUrl = await searchPexelsImage(query, 600, 400);
            return { ...dest, imageUrl: pexelsImageUrl, isLoadingImage: false };
          } catch (error) {
            console.error(`Failed to load image for ${dest.name}:`, error);
            return { ...dest, imageUrl: dest.imageUrl || PLACEHOLDER_IMAGE_URL(600, 400), isLoadingImage: false };
          }
        })
      );
      setDestinations(destinationsWithFetchedImages);
    };

    if (initialDestinations.length > 0) {
      fetchImages();
    } else {
      // If no initial destinations, ensure loading is false for empty state
      setDestinations([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDestinations]); // Rerun when initialDestinations prop changes

  const filteredDestinations = destinations.filter(destination =>
    destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (destination.region && destination.region.toLowerCase().includes(searchQuery.toLowerCase())) ||
    destination.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Interactive Map of Indian Treks</CardTitle>
          <CardDescription>Visualize trek routes and plan your journey. (Map integration coming soon!)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
            <Globe className="h-16 w-16" />
            <p className="ml-4 text-lg">Map will be displayed here.</p>
          </div>
        </CardContent>
      </Card>

      {filteredDestinations.length === 0 && !destinations.some(d => d.isLoadingImage) && (
         <Card>
            <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Treks Found</h3>
                <p className="text-muted-foreground">
                    {searchQuery ? "Try adjusting your search query." : "There are no treks available at the moment. Please check back later or ensure data is loaded in the database."}
                </p>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map((destination) => (
          <Card key={destination.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="p-0 relative h-48">
              {destination.isLoadingImage ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <Image
                  src={destination.imageUrl} // This will be updated by Pexels fetch
                  alt={destination.name}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={destination.aiHint || destination.name} // Use aiHint from object
                  onError={(e) => {
                     // Fallback if Pexels image also fails or if initial URL was bad
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(600,400);
                  }}
                />
              )}
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="font-headline text-lg mb-1">{destination.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {destination.country}{destination.region ? `, ${destination.region}` : ''}
              </div>
              <CardDescription className="text-sm line-clamp-3">{destination.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 border-t flex justify-between items-center">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="text-sm font-semibold">{destination.averageRating}</span>
              </div>
              <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                <Link href={`/explore/${destination.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
