
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, UserCircle, MapPin, Star as StarIcon, CheckCircle, Heart, Briefcase, Languages, Mountain, LogIn, Loader2 } from "lucide-react";
import type { UserProfile, Destination } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/services/users';
import { Skeleton } from '@/components/ui/skeleton';

// Wishlist and History AITags can be dynamic based on actual destination data if needed.
// For simplicity, keeping them similar to how they were.
const WishlistAITags = ["kashmir lakes", "uttarakhand roopkund", "himalayan peaks", "alpine meadow"];
const HistoryAITags = ["himachal hampta", "uttarakhand kedarkantha", "himachal triund", "mountain pass"];


function DestinationItemCard({ destination, aiHint }: { destination: Destination, aiHint: string }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-32">
        <Image 
          src={destination.imageUrl || PLACEHOLDER_IMAGE_URL(300,200)} 
          alt={destination.name} 
          layout="fill" 
          objectFit="cover" 
          data-ai-hint={aiHint} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(300,200);
          }}
        />
      </div>
      <CardContent className="p-3">
        <h4 className="font-semibold text-sm truncate hover:text-primary">
          <Link href={`/explore/${destination.id}`}>{destination.name}</Link>
        </h4>
        <p className="text-xs text-muted-foreground truncate">{destination.country}{destination.region ? `, ${destination.region}` : ''}</p>
      </CardContent>
    </Card>
  );
}


export default function ProfilePage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (firebaseUser) {
      setIsLoadingProfile(true);
      getUserProfile(firebaseUser.uid)
        .then(profile => {
          setUserProfile(profile);
        })
        .catch(error => {
          console.error("Failed to fetch user profile:", error);
          setUserProfile(null); // Set to null on error
        })
        .finally(() => {
          setIsLoadingProfile(false);
        });
    } else if (!authLoading) {
      // If auth is not loading and there's no firebaseUser, stop loading profile.
      setIsLoadingProfile(false);
    }
  }, [firebaseUser, authLoading]);

  if (authLoading || isLoadingProfile) {
    return (
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="items-center text-center md:text-left md:flex-row md:items-start md:gap-6">
            <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-primary shadow-md" />
            <div className="flex-1 mt-4 md:mt-0 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full max-w-prose" />
              <Skeleton className="h-4 w-3/4 max-w-prose" />
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-6 space-y-4">
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Tabs defaultValue="wishlist">
          <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3 mx-auto">
            <TabsTrigger value="wishlist"><Heart className="mr-2 h-4 w-4" />Wishlist</TabsTrigger>
            <TabsTrigger value="history"><CheckCircle className="mr-2 h-4 w-4" />Travel History</TabsTrigger>
          </TabsList>
          <TabsContent value="wishlist" className="mt-6">
            <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <Card className="text-center shadow-lg p-8">
        <CardHeader>
          <UserCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="font-headline text-2xl">Access Your Profile</CardTitle>
          <CardDescription>Please sign in to view and manage your TrekConnect profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/auth/signin">
              <LogIn className="mr-2 h-5 w-5" /> Sign In
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!userProfile) {
     return (
      <Card className="text-center shadow-lg p-8">
        <CardHeader>
          <UserCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="font-headline text-2xl">Profile Not Found</CardTitle>
          <CardDescription>We couldn&apos;t load your profile details. This might be a new account.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Try editing your profile to add more details.</p>
           <Button asChild variant="outline">
            <Link href="/profile/edit">
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Link>
           </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center md:text-left md:flex-row md:items-start md:gap-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary shadow-md">
            <AvatarImage 
              src={userProfile.photoUrl || PLACEHOLDER_IMAGE_URL(128,128)} 
              alt={userProfile.name || "User"} 
              data-ai-hint={`person portrait ${userProfile.name?.split(' ')[0] || 'user'}`}
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(128,128);}}
            />
            <AvatarFallback className="text-4xl">{userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                <CardTitle className="font-headline text-3xl text-primary">{userProfile.name || "Trekker"}</CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link href="/profile/edit">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </Link>
                </Button>
            </div>
            <CardDescription className="mt-1 text-lg">
              {userProfile.age ? `${userProfile.age} years old` : ''}{userProfile.age && userProfile.gender ? ', ' : ''}{userProfile.gender || ''}
            </CardDescription>
            <p className="mt-3 text-foreground/80 max-w-prose mx-auto md:mx-0">
              {userProfile.bio || "No bio yet. Tell us about your adventures!"}
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mt-4">
            <div className="flex items-center p-3 bg-background rounded-lg border">
              <Briefcase className="h-5 w-5 mr-3 text-primary" />
              <div>
                <strong>Preferences:</strong> 
                {userProfile.travelPreferences?.soloOrGroup || 'N/A'}, {userProfile.travelPreferences?.budget || 'N/A'}
                {userProfile.travelPreferences?.style ? `, ${userProfile.travelPreferences.style}` : ''}
              </div>
            </div>
            <div className="flex items-center p-3 bg-background rounded-lg border">
              <Languages className="h-5 w-5 mr-3 text-primary" />
              <div>
                <strong>Languages:</strong> {userProfile.languagesSpoken?.join(', ') || 'N/A'}
              </div>
            </div>
            <div className="flex items-center p-3 bg-background rounded-lg border">
              <Mountain className="h-5 w-5 mr-3 text-primary" />
              <div>
                <strong>Trekking:</strong> {userProfile.trekkingExperience || 'N/A'}
              </div>
            </div>
          </div>

          {userProfile.badges && userProfile.badges.length > 0 && (
            <div className="mt-6">
              <h3 className="font-headline text-lg mb-2 text-center md:text-left">Badges & Achievements</h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {userProfile.badges.map(badge => (
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
          <TabsTrigger value="wishlist"><Heart className="mr-2 h-4 w-4" />Wishlist ({userProfile.wishlistDestinations?.length || 0})</TabsTrigger>
          <TabsTrigger value="history"><CheckCircle className="mr-2 h-4 w-4" />Travel History ({userProfile.travelHistory?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="wishlist" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">My Wishlist</CardTitle>
              <CardDescription>Destinations I dream of visiting.</CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile.wishlistDestinations && userProfile.wishlistDestinations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userProfile.wishlistDestinations.map((dest, index) => <DestinationItemCard key={dest.id} destination={dest} aiHint={WishlistAITags[index % WishlistAITags.length]} />)}
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
              {userProfile.travelHistory && userProfile.travelHistory.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userProfile.travelHistory.map((dest, index) => <DestinationItemCard key={dest.id} destination={dest} aiHint={HistoryAITags[index % HistoryAITags.length]} />)}
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
