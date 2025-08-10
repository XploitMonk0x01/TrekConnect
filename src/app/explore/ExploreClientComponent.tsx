
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  Search,
  Star,
  Filter as FilterIcon,
  Globe,
  Heart,
  Loader2,
  AlertTriangle,
  Route as RouteIcon,
  PlayCircle,
  XCircle,
  Wand2,
} from 'lucide-react'
import type { Destination, WeatherInfo } from '@/lib/types'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { searchPexelsImage } from '@/services/pexels'
import { searchYouTubeVideoId } from '@/services/youtube'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { useToast } from '@/hooks/use-toast'
import { updateUserProfileClient } from '@/services/users'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { filterDestinations } from '@/ai/flows/filter-destinations-flow'

interface ExploreClientComponentProps {
  initialDestinations: Destination[]
}

type DestinationWithMedia = Destination & {
  isLoadingImage?: boolean
  fetchedImageUrl?: string
  isLoadingYouTubeVideoId?: boolean
  youtubeVideoId: string | null
  weather?: WeatherInfo | null
  isLoadingWeather?: boolean
  weatherError?: string | null
}

// Cache key for localStorage
const IMAGE_CACHE_STORAGE_KEY = 'trekconnect_image_cache'

// Helper to get cache from localStorage
function getCache(): Map<string, string> {
  if (typeof window === 'undefined') return new Map() // Server-side check
  try {
    const cachedData = localStorage.getItem(IMAGE_CACHE_STORAGE_KEY)
    return cachedData ? new Map(JSON.parse(cachedData)) : new Map()
  } catch (e) {
    console.error('Failed to read image cache from localStorage:', e)
    return new Map()
  }
}

// Helper to set cache in localStorage
function setCache(cache: Map<string, string>): void {
  if (typeof window === 'undefined') return // Server-side check
  try {
    localStorage.setItem(
      IMAGE_CACHE_STORAGE_KEY,
      JSON.stringify(Array.from(cache.entries()))
    )
  } catch (e) {
    console.error('Failed to write image cache to localStorage:', e)
    // Handle potential QuotaExceededError if necessary
  }
}

// Initialize cache from localStorage
const imageCache = getCache()

export default function ExploreClientComponent({
  initialDestinations,
}: ExploreClientComponentProps) {
  const {
    user: currentUser,
    isLoading: authIsLoading,
    updateUserInContext,
  } = useCustomAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [destinations, setDestinations] = useState<DestinationWithMedia[]>(
    initialDestinations.map((d) => ({
      ...d,
      fetchedImageUrl: d.imageUrl, // Start with initial URL
      youtubeVideoId: null,
      weather: null, // Weather data will be populated later
      weatherError: null,
    }))
  )
  
  const [mediaLoadingState, setMediaLoadingState] = useState<Record<string, {image: boolean, video: boolean}>>({})

  const [searchQuery, setSearchQuery] = useState('')
  const [wishlistProcessing, setWishlistProcessing] = useState<
    Record<string, boolean>
  >({})
  const [mapUrl, setMapUrl] = useState<string | null>(null)
  const [selectedYouTubeVideoId, setSelectedYouTubeVideoId] = useState<
    string | null
  >(null)

  const [aiFilterQuery, setAiFilterQuery] = useState('')
  const [isFilteringWithAI, setIsFilteringWithAI] = useState(false)
  const [aiFilteredDestinationIds, setAiFilteredDestinationIds] = useState<
    string[] | null
  >(null)
  const [aiFilterExplanation, setAiFilterExplanation] = useState<string | null>(
    null
  )

  const isLoadingInitialData = useMemo(() => {
    if (initialDestinations.length === 0) return false;
    // Check if any destination is still in its initial loading state
    return Object.keys(mediaLoadingState).length < initialDestinations.length || Object.values(mediaLoadingState).some(s => s.image || s.video);
  }, [mediaLoadingState, initialDestinations.length]);


  // Memoize the displayed destinations to prevent unnecessary re-renders
  const displayedDestinations = useMemo(() => {
    let currentList = destinations.filter(
      (destination) =>
        destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (destination.region &&
          destination.region
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        destination.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    )

    if (aiFilteredDestinationIds) {
      const orderedByIds = aiFilteredDestinationIds
        .map((id) => currentList.find((dest) => dest.id === id))
        .filter(Boolean) as DestinationWithMedia[]

      currentList = orderedByIds
    }
    return currentList
  }, [destinations, searchQuery, aiFilteredDestinationIds])

  const fetchMediaForDestination = useCallback(async (dest: Destination, signal: AbortSignal) => {
    const imageQuery = dest.aiHint || dest.name
    let pexelsImageUrl = dest.imageUrl || PLACEHOLDER_IMAGE_URL(600, 400)

    if (imageCache.has(imageQuery)) {
        pexelsImageUrl = imageCache.get(imageQuery)!
    } else {
        try {
            const fetchedUrl = await searchPexelsImage(imageQuery, 600, 400)
            if (signal.aborted) return;
            pexelsImageUrl = fetchedUrl
            imageCache.set(imageQuery, fetchedUrl)
            setCache(imageCache)
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              console.error(`Failed to load Pexels image for ${dest.name}:`, error)
            }
        }
    }
    
    setMediaLoadingState(prev => ({...prev, [dest.id]: {...(prev[dest.id] || {video: true}), image: false}}))
    setDestinations(prev => prev.map(d => d.id === dest.id ? {...d, fetchedImageUrl: pexelsImageUrl} : d))

    const youtubeQuery = dest.aiHint || `${dest.name} ${dest.region || dest.country || ''}`
    try {
        const fetchedYoutubeVideoId = await searchYouTubeVideoId(youtubeQuery)
        if (signal.aborted) return;
        setDestinations(prev => prev.map(d => d.id === dest.id ? {...d, youtubeVideoId: fetchedYoutubeVideoId} : d))
    } catch (error) {
       if ((error as Error).name !== 'AbortError') {
         console.error(`Failed to load YouTube video ID for ${dest.name}:`, error)
       }
    }
    setMediaLoadingState(prev => ({...prev, [dest.id]: {...(prev[dest.id] || {image: false}), video: false}}))

  }, []);

  useEffect(() => {
    const abortController = new AbortController()
    
    if (initialDestinations.length > 0) {
        const initialLoadingState: Record<string, {image: boolean, video: boolean}> = {};
        initialDestinations.forEach(d => {
            initialLoadingState[d.id] = { image: true, video: true };
        });
        setMediaLoadingState(initialLoadingState);

        initialDestinations.forEach(dest => {
            fetchMediaForDestination(dest, abortController.signal)
        });
        
        const firstDestinationWithCoords = initialDestinations.find(
          (d) => d.coordinates?.lat && d.coordinates?.lng
        )
        if (firstDestinationWithCoords && firstDestinationWithCoords.coordinates) {
          const { lat, lng } = firstDestinationWithCoords.coordinates
          const zoomLevel = 0.5
          setMapUrl(
            `https://www.openstreetmap.org/export/embed.html?bbox=${
              lng - zoomLevel
            }%2C${lat - zoomLevel}%2C${lng + zoomLevel}%2C${
              lat + zoomLevel
            }&layer=mapnik&marker=${lat}%2C${lng}`
          )
        } else {
           setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=68.0%2C25.0%2C97.0%2C35.0&layer=mapnik`)
        }
    } else {
        setDestinations([])
    }

    return () => {
      abortController.abort()
    }
  }, [initialDestinations, fetchMediaForDestination])


  const handleApplyAIFilter = async () => {
    if (!aiFilterQuery.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Filter',
        description: "Please enter what you're looking for.",
      })
      return
    }
    setIsFilteringWithAI(true)
    setAiFilterExplanation(null)
    try {
      const destinationsToFilter = initialDestinations.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description.substring(0, 300),
        region: d.region,
        travelTips: d.travelTips?.substring(0, 200),
        aiHint: d.aiHint,
      }))

      const result = await filterDestinations({
        filterQuery: aiFilterQuery,
        destinationsToFilter,
      })
      setAiFilteredDestinationIds(result.relevantDestinationIds)
      setAiFilterExplanation(
        result.aiExplanation || 'AI has filtered the destinations.'
      )
      toast({
        title: 'AI Filter Applied',
        description: result.aiExplanation || 'Destinations have been filtered.',
      })
    } catch (error: any) {
      console.error('Error applying AI filter:', error)
      toast({
        variant: 'destructive',
        title: 'AI Filter Failed',
        description: error.message || 'Could not apply AI filter.',
      })
      setAiFilteredDestinationIds(null)
    } finally {
      setIsFilteringWithAI(false)
    }
  }

  const handleClearAIFilter = () => {
    setAiFilterQuery('')
    setAiFilteredDestinationIds(null)
    setAiFilterExplanation(null)
    toast({ title: 'AI Filter Cleared' })
  }

  const handleToggleWishlist = async (
    destinationId: string,
    destinationName: string
  ) => {
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to add items to your wishlist.',
        action: (
          <Button onClick={() => router.push('/auth/signin?redirect=/explore')}>
            Sign In
          </Button>
        ),
      })
      return
    }
    setWishlistProcessing((prev) => ({ ...prev, [destinationId]: true }))
    const currentWishlist = currentUser.wishlistDestinations || []
    const isWishlisted = currentWishlist.includes(destinationName)
    const newWishlist = isWishlisted
      ? currentWishlist.filter((name) => name !== destinationName)
      : [...currentWishlist, destinationName]
    try {
      await updateUserProfileClient(currentUser.id, {
        wishlistDestinations: newWishlist,
      })
      // Update local context optimistically
      updateUserInContext({
        ...currentUser,
        wishlistDestinations: newWishlist,
      })
      toast({
        title: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
        description: `${destinationName} has been ${
          isWishlisted ? 'removed from' : 'added to'
        } your wishlist.`,
      })
    } catch (error) {
      console.error('Error updating wishlist:', error)
      toast({
        variant: 'destructive',
        title: 'Wishlist Update Failed',
        description: 'Could not update your wishlist.',
      })
    } finally {
      setWishlistProcessing((prev) => ({ ...prev, [destinationId]: false }))
    }
  }

  const isDestinationInWishlist = (destinationName: string): boolean => {
    if (!currentUser || !currentUser.wishlistDestinations) return false
    return currentUser.wishlistDestinations.includes(destinationName)
  }

  const openVideoModal = (videoId: string) => setSelectedYouTubeVideoId(videoId)
  const closeVideoModal = () => setSelectedYouTubeVideoId(null)

  const DestinationCardSkeleton = () => (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="p-0 relative h-48">
        <Skeleton className="h-full w-full" />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <div className="space-y-2 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t grid grid-cols-2 gap-2 items-center">
        <div className="flex items-center col-span-1">
          <Skeleton className="h-5 w-5 mr-1.5 rounded-full" />
          <Skeleton className="h-5 w-8" />
        </div>
        <Skeleton className="h-9 w-full col-span-1" />
        <div className="col-span-full mt-2 grid grid-cols-2 gap-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-8 container mx-auto max-w-7xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">
            Explore Indian Treks
          </CardTitle>
          <CardDescription>
            Find your next Himalayan adventure. Search for treks or use our
            AI-powered filter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
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
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                placeholder="AI Filter: e.g., 'easy treks in Uttarakhand for beginners'"
                className="flex-grow"
                value={aiFilterQuery}
                onChange={(e) => setAiFilterQuery(e.target.value)}
                disabled={isFilteringWithAI}
              />
              <Button
                onClick={handleApplyAIFilter}
                disabled={isFilteringWithAI || !aiFilterQuery.trim()}
                className="bg-accent hover:bg-accent/90"
              >
                {isFilteringWithAI ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}{' '}
                Apply AI Filter
              </Button>
              {aiFilteredDestinationIds && (
                <Button
                  variant="outline"
                  onClick={handleClearAIFilter}
                  disabled={isFilteringWithAI}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Clear AI Filter
                </Button>
              )}
            </div>
          </div>
          {aiFilterExplanation && (
            <div className="mt-2 p-3 bg-muted/50 border border-border rounded-md text-sm text-muted-foreground">
              <p className="font-semibold">AI Filter Note:</p>
              <p>{aiFilterExplanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">
            Interactive Map of Indian Treks
          </CardTitle>
          <CardDescription>
            Visualize trek routes and plan your journey. (Powered by
            OpenStreetMap)
          </CardDescription>
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
            <div className="h-[400px] w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mr-2" /> Loading map...
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingInitialData ? (
          [...Array(initialDestinations.length || 3)].map((_, index) => (
            <DestinationCardSkeleton key={`skeleton-${index}`} />
          ))
        ) : displayedDestinations.length > 0 ? (
          displayedDestinations.map((destination) => (
            <Card
              key={destination.id}
              className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <CardHeader className="p-0 relative h-48">
                <Image
                  src={
                    destination.fetchedImageUrl ||
                    PLACEHOLDER_IMAGE_URL(600, 400)
                  }
                  alt={destination.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  data-ai-hint={
                    destination.aiHint ||
                    destination.name
                      .toLowerCase()
                      .split(' ')
                      .slice(0, 2)
                      .join(' ')
                  }
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(
                      600,
                      400
                    )
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white hover:text-pink-400 rounded-full"
                  onClick={() =>
                    handleToggleWishlist(destination.id, destination.name)
                  }
                  disabled={wishlistProcessing[destination.id] || authIsLoading}
                  aria-label={
                    isDestinationInWishlist(destination.name)
                      ? 'Remove from wishlist'
                      : 'Add to wishlist'
                  }
                >
                  {wishlistProcessing[destination.id] ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart
                      className={`h-5 w-5 ${
                        isDestinationInWishlist(destination.name)
                          ? 'fill-pink-500 text-pink-500'
                          : 'text-white'
                      }`}
                    />
                  )}
                </Button>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="font-headline text-lg mb-1">
                  {destination.name}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {destination.country}
                  {destination.region ? `, ${destination.region}` : ''}
                </div>
                <CardDescription className="text-sm line-clamp-3">
                  {destination.description}
                </CardDescription>
                {destination.isLoadingWeather ? (
                  <div className="text-xs text-muted-foreground mt-1">
                    Loading weather...
                  </div>
                ) : destination.weatherError ? (
                  <div className="text-xs text-destructive mt-1">
                    Weather unavailable
                  </div>
                ) : destination.weather ? (
                  <div className="text-xs text-blue-700 mt-1">
                    Weather: {destination.weather.condition}
                  </div>
                ) : null}
              </CardContent>
              <CardFooter className="p-4 border-t grid grid-cols-2 gap-2 items-center">
                <div className="flex items-center col-span-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="text-sm font-semibold">
                    {destination.averageRating}
                  </span>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5 col-span-1"
                >
                  <Link href={`/explore/${destination.id}`}>View Details</Link>
                </Button>
                <div className="col-span-full mt-2 grid grid-cols-2 gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent/5"
                  >
                    <Link
                      href={`/explore/routes/new?destinationId=${destination.id}`}
                    >
                      <RouteIcon className="mr-2 h-4 w-4" /> Plan Route
                    </Link>
                  </Button>
                  {destination.youtubeVideoId && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-accent text-accent hover:bg-accent/10"
                      onClick={() =>
                        openVideoModal(destination.youtubeVideoId!)
                      }
                      disabled={mediaLoadingState[destination.id]?.video}
                    >
                      {mediaLoadingState[destination.id]?.video ? 
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                       <PlayCircle className="mr-2 h-4 w-4" />
                      }
                      Watch Video
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3">
             <Card>
                <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Treks Found</h3>
                <p className="text-muted-foreground">
                    {searchQuery || aiFilterQuery
                    ? 'Try adjusting your search or AI filter query.'
                    : 'There are no treks available at the moment.'}
                </p>
                </CardContent>
            </Card>
          </div>
        )}
      </div>

      {selectedYouTubeVideoId && (
        <Dialog
          open={!!selectedYouTubeVideoId}
          onOpenChange={(isOpen) => !isOpen && closeVideoModal()}
        >
          <DialogContent className="max-w-3xl p-6">
            <DialogHeader className="pb-2">
              <DialogTitle>Video Preview</DialogTitle>
            </DialogHeader>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedYouTubeVideoId}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
