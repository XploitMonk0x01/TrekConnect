import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, Star, Filter, Globe } from "lucide-react";
import type { Destination } from "@/lib/types";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

const mockDestinations: Destination[] = [
  { id: "1", name: "Everest Base Camp", description: "A challenging trek to the foot of the world's highest peak.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "Nepal", averageRating: 4.8, region: "Himalayas" },
  { id: "2", name: "Patagonia Wilderness", description: "Explore rugged mountains, glaciers, and pristine lakes.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "Chile/Argentina", averageRating: 4.9, region: "Andes" },
  { id: "3", name: "Kyoto Temples", description: "Discover ancient temples and serene gardens in Japan's cultural heart.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "Japan", averageRating: 4.7, region: "Kansai" },
  { id: "4", name: "Serengeti Safari", description: "Witness the Great Migration and diverse wildlife in Tanzania.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "Tanzania", averageRating: 4.9, region: "Africa" },
  { id: "5", name: "Rome Ancient Ruins", description: "Step back in time exploring iconic historical sites.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "Italy", averageRating: 4.6, region: "Europe" },
  { id: "6", name: "Banff National Park", description: "Turquoise lakes, majestic peaks, and abundant wildlife in Canada.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "Canada", averageRating: 4.8, region: "Rockies" },
];

const AITags = ["trekking mountains", "patagonia landscape", "japan temple", "safari animals", "rome colosseum", "canada lakes"];


export default function ExplorePage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Explore Destinations</CardTitle>
          <CardDescription>Find your next adventure. Search for destinations or browse our curated list.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input type="search" placeholder="Search destinations (e.g., Paris, Himalayas, Trekking)" className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for Google Maps Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Interactive Map</CardTitle>
          <CardDescription>Visualize destinations and plan your routes. (Map integration coming soon!)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
            <Globe className="h-16 w-16" />
            <p className="ml-4 text-lg">Google Maps will be displayed here.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDestinations.map((destination, index) => (
          <Card key={destination.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="p-0 relative h-48">
              <Image
                src={destination.imageUrl}
                alt={destination.name}
                layout="fill"
                objectFit="cover"
                data-ai-hint={AITags[index % AITags.length]}
              />
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
