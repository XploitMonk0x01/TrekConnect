
'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Edit,
  Star as StarIcon,
  CheckCircle,
  Heart,
  Briefcase,
  Languages,
  Mountain,
  Loader2,
  AlertTriangle,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import type { Destination } from '@/lib/types'; 
import Image from 'next/image'; 
import { useCustomAuth } from '@/contexts/CustomAuthContext';

// Wishlist and History AITags are removed as we display names directly

function DestinationNameCard({ name }: { name: string }) {
  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
        <p className="text-sm font-medium truncate hover:text-primary">
          {/* In a future step, this could link to an /explore/search?name={name} or similar */}
          {name}
        </p>
      </div>
    </Card>
  );
}


export default function ProfilePage() {
  const { user: currentUser, isLoading: authIsLoading } = useCustomAuth();

  if (authIsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Profile...</span>
      </div>
    );
  }

  if (!currentUser && !authIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground">
          You need to be logged in to view your profile.
        </p>
        <Button asChild className="mt-6">
          <Link href="/auth/signin?redirect=/profile">Sign In</Link>
        </Button>
      </div>
    );
  }
  
  const getAvatarFallback = (name?: string | null, email?: string | null): string => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center md:text-left md:flex-row md:items-start md:gap-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary shadow-md">
            <AvatarImage
              src={currentUser.photoUrl || PLACEHOLDER_IMAGE_URL(128, 128)}
              alt={currentUser.name || 'User'}
              data-ai-hint={`person portrait ${currentUser.name?.split(' ')[0] || 'user'}`}
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(128,128); }}
            />
            <AvatarFallback className="text-4xl">
              {getAvatarFallback(currentUser.name, currentUser.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <CardTitle className="font-headline text-3xl text-primary">
                {currentUser.name || 'Trekker'}
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/profile/edit">
                  <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
              </Button>
            </div>
            <CardDescription className="mt-1 text-lg">
              {currentUser.age ? `${currentUser.age} years old` : ''}
              {currentUser.age && currentUser.gender ? ', ' : ''}
              {currentUser.gender || ''}
            </CardDescription>
            <p className="mt-3 text-foreground/80 max-w-prose mx-auto md:mx-0">
              {currentUser.bio || 'No bio yet. Tell us about your adventures!'}
            </p>
             <p className="text-xs text-muted-foreground mt-1">Joined: {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mt-4">
            <div className="flex items-center p-3 bg-background rounded-lg border">
              <Briefcase className="h-5 w-5 mr-3 text-primary" />
              <div>
                <strong>Preferences:</strong>
                {currentUser.travelPreferences?.soloOrGroup || 'N/A'},{' '}
                {currentUser.travelPreferences?.budget || 'N/A'}
                {currentUser.travelPreferences?.style ? `, ${currentUser.travelPreferences.style}` : ''}
              </div>
            </div>
            <div className="flex items-center p-3 bg-background rounded-lg border">
              <Languages className="h-5 w-5 mr-3 text-primary" />
              <div>
                <strong>Languages:</strong> {currentUser.languagesSpoken?.join(', ') || 'N/A'}
              </div>
            </div>
            <div className="flex items-center p-3 bg-background rounded-lg border">
              <Mountain className="h-5 w-5 mr-3 text-primary" />
              <div>
                <strong>Trekking:</strong> {currentUser.trekkingExperience || 'N/A'}
              </div>
            </div>
          </div>

          {currentUser.badges && currentUser.badges.length > 0 && (
            <div className="mt-6">
              <h3 className="font-headline text-lg mb-2 text-center md:text-left">
                Badges & Achievements
              </h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {currentUser.badges.map((badge) => (
                  <Badge key={badge.id} variant="secondary" className="py-1 px-3 text-sm shadow-sm" >
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
          <TabsTrigger value="wishlist">
            <Heart className="mr-2 h-4 w-4" />
            Wishlist ({(currentUser.wishlistDestinations || []).length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <CheckCircle className="mr-2 h-4 w-4" />
            Travel History ({(currentUser.travelHistory || []).length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="wishlist" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">My Wishlist</CardTitle>
              <CardDescription>Destinations I dream of visiting.</CardDescription>
            </CardHeader>
            <CardContent>
              {(currentUser.wishlistDestinations || []).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(currentUser.wishlistDestinations || []).map((destName, index) => (
                     <DestinationNameCard key={`wishlist-${index}`} name={destName} />
                  ))}
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
              {(currentUser.travelHistory || []).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   {(currentUser.travelHistory || []).map((destName, index) => (
                     <DestinationNameCard key={`history-${index}`} name={destName} />
                  ))}
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
