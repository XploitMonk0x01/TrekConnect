
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
  name: "Rohan Sharma",
  age: 32,
  gender: "Male",
  photoUrl: PLACEHOLDER_IMAGE_URL(128,128),
  bio: "Enthusiastic trekker exploring the Indian Himalayas. Love sharing stories and connecting with fellow adventurers. Aiming to complete all major treks in Uttarakhand and Himachal!",
  travelPreferences: { soloOrGroup: "Group", budget: "Mid-range", style: "Adventure & Photography" },
  languagesSpoken: ["Hindi", "English", "Basic Garhwali"],
  trekkingExperience: "Advanced",
  wishlistDestinations: [
    { id: "in6", name: "Kashmir Great Lakes Trek", description: "Breathtaking trek traversing several high-altitude alpine lakes in Kashmir.", imageUrl: PLACEHOLDER_IMAGE_URL(300,200), country: "India", averageRating: 4.9, region: "Kashmir" },
    { id: "in1", name: "Roopkund Trek", description: "Mysterious skeletal lake trek in Uttarakhand.", imageUrl: PLACEHOLDER_IMAGE_URL(300,200), country: "India", averageRating: 4.7, region: "Uttarakhand" },
  ],
  travelHistory: [
    { id: "in2", name: "Hampta Pass Trek", description: "Dramatic crossover trek in Himachal Pradesh.", imageUrl: PLACEHOLDER_IMAGE_URL(300,200), country: "India", averageRating: 4.6, region: "Himachal Pradesh" },
    { id: "in4", name: "Kedarkantha Trek", description: "Popular winter trek in Uttarakhand.", imageUrl: PLACEHOLDER_IMAGE_URL(300,200), country: "India", averageRating: 4.5, region: "Uttarakhand" },
    { id: "in5", name: "Triund Trek", description: "Short scenic trek near McLeod Ganj.", imageUrl: PLACEHOLDER_IMAGE_URL(300,200), country: "India", averageRating: 4.4, region: "Himachal Pradesh" },
  ],
  badges: [
    { id: "b1", name: "Himalayan Explorer", description: "Completed 3+ Himalayan Treks" },
    { id: "b2", name: "Uttarakhand Voyager", description: "Explored treks in Uttarakhand" },
    { id: "b3", name: "Himachal Hiker", description: "Trekking enthusiast in Himachal" },
  ]
};

const WishlistAITags = ["kashmir lakes", "uttarakhand roopkund"];
const HistoryAITags = ["himachal hampta", "uttarakhand kedarkantha", "himachal triund"];


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
            <AvatarImage src={user.photoUrl} alt={user.name} data-ai-hint="person portrait Rohan" />
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
