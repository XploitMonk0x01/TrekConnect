import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, UserCircle, MapPin, Star as StarIcon, CheckCircle, Heart, Briefcase, Languages, Mountain } from "lucide-react";
import type { UserProfile, Destination, Badge as BadgeType } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

const mockUserProfile: UserProfile = {
  id: "currentUser",
  name: "Wanderlust Weaver",
  age: 29,
  gender: "Female",
  photoUrl: PLACEHOLDER_IMAGE_URL(128,128) + "?text=WW",
  bio: "Passionate trekker, photographer, and storyteller. Always seeking the next horizon and a good cup of coffee. My goal is to visit every continent and hike its most iconic trails.",
  travelPreferences: { soloOrGroup: "Flexible", budget: "Mid-range", style: "Adventure & Cultural" },
  languagesSpoken: ["English", "Spanish", "Basic French"],
  trekkingExperience: "Advanced",
  wishlistDestinations: [
    { id: "dest3", name: "Annapurna Circuit", description: "Classic trek in Nepal with diverse landscapes.", imageUrl: PLACEHOLDER_IMAGE_URL(300,200), country: "Nepal", averageRating: 4.9, region: "Himalayas" },
    { id: "dest4", name: "Inca Trail to Machu Picchu", description: "Iconic trek through ancient Inca ruins.", imageUrl: PLACEHOLDER_IMAGE_URL(300,200), country: "Peru", averageRating: 4.8, region: "Andes" },
  ],
  travelHistory: [
    { id: "1", name: "Everest Base Camp", description: "Challenging trek to the foot of the world's highest peak.", imageUrl: PLACEHOLDER_IMAGE_URL(300,200), country: "Nepal", averageRating: 4.8, region: "Himalayas" },
    { id: "2", name: "Patagonia Wilderness", description: "Rugged mountains, glaciers, and pristine lakes.", imageUrl: PLACEHOLDER_IMAGE_URL(300,200), country: "Chile/Argentina", averageRating: 4.9, region: "Andes" },
  ],
  badges: [
    { id: "b1", name: "Himalayan Hero", description: "Conquered Everest Base Camp" },
    { id: "b2", name: "Patagonia Pioneer", description: "Explored the Patagonian Wilderness" },
    { id: "b3", name: "Storyteller", description: "Shared 5+ travel stories" },
  ]
};

const WishlistAITags = ["nepal mountains", "peru machu picchu"];
const HistoryAITags = ["himalayas nepal", "patagonia argentina"];


function DestinationItemCard({ destination, aiHint }: { destination: Destination, aiHint: string }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-32">
        <Image src={destination.imageUrl} alt={destination.name} layout="fill" objectFit="cover" data-ai-hint={aiHint} />
      </div>
      <CardContent className="p-3">
        <h4 className="font-semibold text-sm truncate hover:text-primary"><Link href={`/explore/${destination.id}`}>{destination.name}</Link></h4>
        <p className="text-xs text-muted-foreground truncate">{destination.country}{destination.region ? `, ${destination.region}` : ''}</p>
      </CardContent>
    </Card>
  );
}


export default function ProfilePage() {
  const user = mockUserProfile;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center md:text-left md:flex-row md:items-start md:gap-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary shadow-md">
            <AvatarImage src={user.photoUrl} alt={user.name} data-ai-hint="person portrait" />
            <AvatarFallback className="text-4xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                <CardTitle className="font-headline text-3xl text-primary">{user.name}</CardTitle>
                <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            </div>
            <CardDescription className="mt-1 text-lg">{user.age} years old, {user.gender}</CardDescription>
            <p className="mt-3 text-foreground/80 max-w-prose mx-auto md:mx-0">{user.bio}</p>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mt-4">
            <div className="flex items-center p-3 bg-background rounded-lg border">
              <Briefcase className="h-5 w-5 mr-3 text-primary" />
              <div>
                <strong>Preferences:</strong> {user.travelPreferences.soloOrGroup}, {user.travelPreferences.budget}, {user.travelPreferences.style}
              </div>
            </div>
            <div className="flex items-center p-3 bg-background rounded-lg border">
              <Languages className="h-5 w-5 mr-3 text-primary" />
              <div>
                <strong>Languages:</strong> {user.languagesSpoken.join(', ')}
              </div>
            </div>
            <div className="flex items-center p-3 bg-background rounded-lg border">
              <Mountain className="h-5 w-5 mr-3 text-primary" />
              <div>
                <strong>Trekking:</strong> {user.trekkingExperience}
              </div>
            </div>
          </div>

          {user.badges && user.badges.length > 0 && (
            <div className="mt-6">
              <h3 className="font-headline text-lg mb-2 text-center md:text-left">Badges & Achievements</h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {user.badges.map(badge => (
                  <Badge key={badge.id} variant="secondary" className="py-1 px-3 text-sm shadow-sm">
                    <StarIcon className="h-4 w-4 mr-1.5 text-yellow-500" /> {badge.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="wishlist">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3 mx-auto">
          <TabsTrigger value="wishlist"><Heart className="mr-2 h-4 w-4" />Wishlist ({user.wishlistDestinations?.length || 0})</TabsTrigger>
          <TabsTrigger value="history"><CheckCircle className="mr-2 h-4 w-4" />Travel History ({user.travelHistory?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="wishlist" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">My Wishlist</CardTitle>
              <CardDescription>Destinations I dream of visiting.</CardDescription>
            </CardHeader>
            <CardContent>
              {user.wishlistDestinations && user.wishlistDestinations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {user.wishlistDestinations.map((dest, index) => <DestinationItemCard key={dest.id} destination={dest} aiHint={WishlistAITags[index % WishlistAITags.length]} />)}
                </div>
              ) : (
                <p className="text-muted-foreground">Your wishlist is empty. <Link href="/explore" className="text-primary hover:underline">Start exploring!</Link></p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">My Travel History</CardTitle>
              <CardDescription>Places I've explored and conquered.</CardDescription>
            </CardHeader>
            <CardContent>
              {user.travelHistory && user.travelHistory.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {user.travelHistory.map((dest, index) => <DestinationItemCard key={dest.id} destination={dest} aiHint={HistoryAITags[index % HistoryAITags.length]} />)}
                </div>
              ) : (
                <p className="text-muted-foreground">No travel history yet. Time to make some memories!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
