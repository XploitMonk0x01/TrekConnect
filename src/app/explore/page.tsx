
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, Star, Filter, Globe } from "lucide-react";
import type { Destination } from "@/lib/types";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

const mockDestinations: Destination[] = [
  { id: "in1", name: "Roopkund Trek", description: "Mysterious skeletal lake trek in Uttarakhand with stunning Himalayan views.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.7, region: "Uttarakhand" },
  { id: "in2", name: "Hampta Pass Trek", description: "Dramatic crossover trek from Kullu's lush greenery to Lahaul's arid landscapes in Himachal.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.6, region: "Himachal Pradesh" },
  { id: "in3", name: "Valley of Flowers Trek", description: "UNESCO site in Uttarakhand, a vibrant meadow of alpine flowers.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.8, region: "Uttarakhand" },
  { id: "in4", name: "Kedarkantha Trek", description: "Popular winter trek in Uttarakhand with panoramic summit views.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.5, region: "Uttarakhand" },
  { id: "in5", name: "Triund Trek", description: "Short, scenic trek near McLeod Ganj, Himachal, offering Dhauladhar views.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.4, region: "Himachal Pradesh" },
  { id: "in6", name: "Kashmir Great Lakes Trek", description: "Breathtaking trek traversing several high-altitude alpine lakes in Kashmir.", imageUrl: PLACEHOLDER_IMAGE_URL(600,400), country: "India", averageRating: 4.9, region: "Kashmir" },
];

const AITags = ["uttarakhand roopkund", "himachal hampta", "uttarakhand valley flowers", "uttarakhand kedarkantha", "himachal triund", "kashmir lakes"];


export default function ExplorePage() {
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
              <Input type="search" placeholder="Search treks (e.g., Roopkund, Himachal, Winter trek)" className="pl-10" />
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
