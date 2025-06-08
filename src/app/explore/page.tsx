
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, Star, Filter, Globe } from "lucide-react";
import type { Destination } from "@/lib/types";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";
import { searchPexelsImage } from "@/services/pexels";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const initialMockDestinations: Destination[] = [
  // Uttarakhand
  { id: "UT1", name: "Roopkund Trek", description: "Mysterious skeletal lake trek in Uttarakhand with stunning Himalayan views of Trishul and Nanda Ghunti.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.7, region: "Uttarakhand" },
  { id: "UT2", name: "Valley of Flowers & Hemkund Sahib", description: "UNESCO site paired with a sacred Sikh shrine, offering vibrant floral meadows and serene spirituality.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.8, region: "Uttarakhand" },
  { id: "UT3", name: "Kedarkantha Trek", description: "Popular winter trek in Uttarakhand with panoramic summit views and enchanting snowy landscapes.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.5, region: "Uttarakhand" },
  { id: "UT4", name: "Har Ki Dun Trek", description: "Cradle-shaped valley known as 'Valley of Gods', with views of Swargarohini peaks and traditional villages.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.6, region: "Uttarakhand" },
  // Himachal Pradesh
  { id: "HP1", name: "Hampta Pass Trek", description: "Dramatic crossover trek from Kullu's lush greenery to Lahaul's arid landscapes in Himachal.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.6, region: "Himachal Pradesh" },
  { id: "HP2", name: "Bhrigu Lake Trek", description: "High-altitude alpine lake trek near Manali, known for its stunning blue waters and panoramic views.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.5, region: "Himachal Pradesh" },
  { id: "HP3", name: "Beas Kund Trek", description: "Trek to the source of the Beas River, offering close views of Pir Panjal range peaks like Hanuman Tibba.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.4, region: "Himachal Pradesh" },
  { id: "HP4", name: "Kareri Lake Trek", description: "Serene trek to a freshwater lake in the Dhauladhar range, surrounded by lush forests and meadows.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.3, region: "Himachal Pradesh" },
  // Ladakh
  { id: "LA1", name: "Markha Valley Trek", description: "Classic Ladakh trek through remote villages, stunning canyons, and high passes with views of Kang Yatse.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.7, region: "Ladakh" },
  { id: "LA2", name: "Sham Valley Trek", description: "Known as the 'Baby Trek', an easier option to experience Ladakhi culture, monasteries, and landscapes.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.2, region: "Ladakh" },
  { id: "LA3", name: "Kang Yatse II & Stok Base Trek", description: "Challenging trek offering views of Kang Yatse II and a taste of high-altitude trekking near Leh.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.8, region: "Ladakh" },
  { id: "LA4", name: "Lamayuru to Alchi Trek", description: "A cultural journey through ancient monasteries and unique Ladakhi landscapes.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.4, region: "Ladakh"}
];

const AITags: Record<string, string> = {
  "UT1": "uttarakhand roopkund trek",
  "UT2": "valley of flowers hemkund sahib",
  "UT3": "kedarkantha winter trek",
  "UT4": "har ki dun uttarakhand",
  "HP1": "himachal hampta pass",
  "HP2": "bhrigu lake manali",
  "HP3": "beas kund himachal",
  "HP4": "kareri lake dhauladhar",
  "LA1": "ladakh markha valley",
  "LA2": "ladakh sham valley trek",
  "LA3": "kang yatse ladakh",
  "LA4": "lamayuru alchi ladakh"
};


export default function ExplorePage() {
  const [destinations, setDestinations] = useState<Destination[]>(initialMockDestinations.map(d => ({...d, isLoadingImage: true })));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      const updatedDestinations = await Promise.all(
        initialMockDestinations.map(async (dest) => {
          const query = AITags[dest.id] || `${dest.name} ${dest.region || ''} trek`;
          try {
            const imageUrl = await searchPexelsImage(query, 600, 400);
            return { ...dest, imageUrl, isLoadingImage: false };
          } catch (error) {
            console.error(`Failed to load image for ${dest.name}:`, error);
            return { ...dest, imageUrl: PLACEHOLDER_IMAGE_URL(600, 400), isLoadingImage: false };
          }
        })
      );
      setDestinations(updatedDestinations);
    };

    fetchImages();
  }, []);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map((destination) => (
          <Card key={destination.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="p-0 relative h-48">
              {destination.isLoadingImage ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <Image
                  src={destination.imageUrl}
                  alt={destination.name}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={AITags[destination.id] || destination.name}
                  onError={() => {
                    setDestinations(prevDests => prevDests.map(d => 
                      d.id === destination.id ? {...d, imageUrl: PLACEHOLDER_IMAGE_URL(600,400), isLoadingImage: false } : d
                    ));
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
