
'use client'

// import { useEffect, useState } from 'react' // Keep for custom auth
// import { useRouter } from 'next/navigation' // Keep for custom auth
// Removed: useAuth
// import { getUserById } from '@/services/auth/auth.service' // Service needs to fetch by MongoDB _id
import Link from 'next/link'
// import type { UserProfile } from '@/lib/types' // Keep
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter, // Not used here
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Edit,
  // UserCircle, // Replaced by Avatar
  // MapPin, // Used in DestinationItemCard
  Star as StarIcon,
  CheckCircle,
  Heart,
  Briefcase,
  Languages,
  Mountain,
  // LogIn, // For sign-in button, not here
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button' // Changed from form-elements
import { Badge } from '@/components/ui/badge'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
// Removed cookies and redirect as this is client component now
import type { Destination } from '@/lib/types'; // Import Destination if not already
import Image from 'next/image'; // Import Image for DestinationItemCard

// Wishlist and History AITags can be dynamic based on actual destination data if needed.
const WishlistAITags = [ /* ... as before ... */ ];
const HistoryAITags = [ /* ... as before ... */ ];

// Define DestinationItemCard locally or import if it's a separate component
function DestinationItemCard({
  destination,
  aiHint,
}: {
  destination: Destination; // Ensure this type is correct, might need id, name, imageUrl, country, region
  aiHint: string;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-32">
        <Image
          src={destination.imageUrl || PLACEHOLDER_IMAGE_URL(300, 200)}
          alt={destination.name}
          layout="fill"
          objectFit="cover"
          data-ai-hint={aiHint}
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(300, 200);
          }}
        />
      </div>
      <CardContent className="p-3">
        <h4 className="font-semibold text-sm truncate hover:text-primary">
          {/* Ensure destination.id is available and correct for the link */}
          <Link href={`/explore/${destination.id || ''}`}>{destination.name}</Link>
        </h4>
        <p className="text-xs text-muted-foreground truncate">
          {destination.country}
          {destination.region ? `, ${destination.region}` : ''}
        </p>
      </CardContent>
    </Card>
  );
}


export default function ProfilePage() {
  // const router = useRouter() // Keep for custom auth
  // const { user } = useAuth() // Removed
  // const [profile, setProfile] = useState<UserProfile | null>(null) // Keep for custom auth
  // const [isLoading, setIsLoading] = useState(true) // Keep for custom auth

  // useEffect(() => { // This logic will need to be adapted for custom auth
  //   // 1. Get user ID from your custom auth context/token
  //   // 2. Call a service like `getUserProfile(customUserId)` from `users.service.ts`
  //   // For now, we'll simulate a logged-out state or loading state
  //   if (!user) { // 'user' would come from your new custom auth context
  //     // router.push('/auth/signin') // Redirect if not logged in
  //     setIsLoading(false); // Stop loading if no user
  //     return
  //   }
  //   const loadProfile = async () => {
  //     try {
  //       // const userProfile = await getUserById(user.id) // user.id from custom auth
  //       // setProfile(userProfile)
  //     } catch (error) {
  //       console.error('Failed to load profile:', error)
  //     } finally {
  //       // setIsLoading(false)
  //     }
  //   }
  //   // loadProfile()
  //   setIsLoading(false); // Simulate loading finished
  // }, [/* user from custom auth context */, router])


  // Placeholder state until custom auth is implemented
  const isLoading = false; 
  const profile = null; // Simulate logged out state

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground">
          You need to be logged in to view your profile.
        </p>
        <Button asChild className="mt-6">
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    );
  }

  // The rest of the UI rendering the profile (assuming 'profile' is populated by custom auth)
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center md:text-left md:flex-row md:items-start md:gap-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary shadow-md">
            <AvatarImage
              src={profile.photoUrl || PLACEHOLDER_IMAGE_URL(128, 128)}
              alt={profile.name || 'User'}
              data-ai-hint={`person portrait ${profile.name?.split(' ')[0] || 'user'}`}
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(128,128); }}
            />
            <AvatarFallback className="text-4xl">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <CardTitle className="font-headline text-3xl text-primary">
                {profile.name || 'Trekker'}
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/profile/edit">
                  <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
              </Button>
            </div>
            <CardDescription className="mt-1 text-lg">
              {profile.age ? `${profile.age} years old` : ''}
              {profile.age && profile.gender ? ', ' : ''}
              {profile.gender || ''}
            </CardDescription>
            <p className="mt-3 text-foreground/80 max-w-prose mx-auto md:mx-0">
              {profile.bio || 'No bio yet. Tell us about your adventures!'}
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mt-4">
            <div className="flex items-center p-3 bg-background rounded-lg border">
              <Briefcase className="h-5 w-5 mr-3 text-primary" />
              <div>
                <strong>Preferences:</strong>
                {profile.travelPreferences?.soloOrGroup || 'N/A'},{' '}
                {profile.travelPreferences?.budget || 'N/A'}
                {profile.travelPreferences?.style ? `, ${profile.travelPreferences.style}` : ''}
              </div>
            </div>
            <div className="flex items-center p-3 bg-background rounded-lg border">
              <Languages className="h-5 w-5 mr-3 text-primary" />
              <div>
                <strong>Languages:</strong> {profile.languagesSpoken?.join(', ') || 'N/A'}
              </div>
            </div>
            <div className="flex items-center p-3 bg-background rounded-lg border">
              <Mountain className="h-5 w-5 mr-3 text-primary" />
              <div>
                <strong>Trekking:</strong> {profile.trekkingExperience || 'N/A'}
              </div>
            </div>
          </div>

          {profile.badges && profile.badges.length > 0 && (
            <div className="mt-6">
              <h3 className="font-headline text-lg mb-2 text-center md:text-left">
                Badges & Achievements
              </h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {profile.badges.map((badge) => (
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
            Wishlist ({(profile.wishlistDestinations || []).length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <CheckCircle className="mr-2 h-4 w-4" />
            Travel History ({(profile.travelHistory || []).length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="wishlist" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">My Wishlist</CardTitle>
              <CardDescription>Destinations I dream of visiting.</CardDescription>
            </CardHeader>
            <CardContent>
              {(profile.wishlistDestinations || []).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* This mapping needs to be fixed - wishlistDestinations is string[] */}
                  {/* You'll need to fetch destination details if you want to show DestinationItemCard */}
                  {(profile.wishlistDestinations || []).map((destName, index) => (
                     <Card key={index} className="p-3"><p className="text-sm">{destName}</p></Card> // Placeholder
                    // <DestinationItemCard key={index} destination={{id: index.toString(), name: destName, imageUrl: PLACEHOLDER_IMAGE_URL(300,200), country:'', region:''}} aiHint={WishlistAITags[index % WishlistAITags.length]} />
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
              {(profile.travelHistory || []).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   {(profile.travelHistory || []).map((destName, index) => (
                     <Card key={index} className="p-3"><p className="text-sm">{destName}</p></Card> // Placeholder
                    // <DestinationItemCard key={index} destination={{id:index.toString(), name: destName, imageUrl: PLACEHOLDER_IMAGE_URL(300,200), country:'', region:''}} aiHint={HistoryAITags[index % HistoryAITags.length]} />
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
