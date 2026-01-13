'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  MapPin,
  Star,
  Sun,
  CloudSun,
  CloudRain,
  CalendarDays,
  ExternalLink,
  Share2,
  ShieldCheck,
  Edit,
  Sparkles,
  Loader2,
  Heart as HeartIcon,
  Route as RouteIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Destination, WeatherInfo, UserProfile } from '@/lib/types'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { generateTrekImage } from '@/ai/flows/generate-trek-image-flow'
import { useToast } from '@/hooks/use-toast'
import { searchPexelsImage } from '@/services/pexels'
import { Skeleton } from '@/components/ui/skeleton'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { updateUserProfileClient } from '@/services/users'

interface DestinationDetailClientContentProps {
  initialDestination: Destination
  mockWeather: WeatherInfo
}

function getWeatherIcon(iconCode?: string) {
  if (!iconCode) return <Sun className="h-5 w-5 text-yellow-500" />
  if (iconCode.includes('01'))
    return <Sun className="h-5 w-5 text-yellow-500" />
  if (
    iconCode.includes('02') ||
    iconCode.includes('03') ||
    iconCode.includes('04')
  )
    return <CloudSun className="h-5 w-5 text-yellow-400" />
  if (iconCode.includes('09') || iconCode.includes('10'))
    return <CloudRain className="h-5 w-5 text-blue-500" />
  return <Sun className="h-5 w-5 text-yellow-500" />
}

export default function DestinationDetailClientContent({
  initialDestination,
  mockWeather,
}: DestinationDetailClientContentProps) {
  const {
    user: currentUser,
    isLoading: authIsLoading,
    updateUserInContext,
  } = useCustomAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [destination, setDestination] =
    useState<Destination>(initialDestination)
  const [mainImage, setMainImage] = useState(
    initialDestination.imageUrl || PLACEHOLDER_IMAGE_URL(1200, 600)
  )
  const [isMainImageLoading, setIsMainImageLoading] = useState(true)
  const [travelerPhotos, setTravelerPhotos] = useState<string[]>([])
  const [areTravelerPhotosLoading, setAreTravelerPhotosLoading] = useState(true)

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  )
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isWishlistProcessing, setIsWishlistProcessing] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  useEffect(() => {
    setDestination(initialDestination)
    setIsMainImageLoading(true)
    setAreTravelerPhotosLoading(true)

    const fetchDynamicImages = async () => {
      const mainImageQuery =
        initialDestination.aiHint || initialDestination.name
      try {
        const pexelsImageUrl = await searchPexelsImage(
          mainImageQuery,
          1200,
          600
        )
        setMainImage(pexelsImageUrl)
      } catch (error) {
        console.error(
          `Failed to load main image for ${initialDestination.name}:`,
          error
        )
        setMainImage(
          initialDestination.imageUrl || PLACEHOLDER_IMAGE_URL(1200, 600)
        )
      } finally {
        setIsMainImageLoading(false)
      }

      const photoQueryBase =
        initialDestination.aiHint || initialDestination.name
      const queries = [
        `${photoQueryBase} trek photo`,
        `${photoQueryBase} scenery`,
        `${photoQueryBase} mountain view`,
        `${photoQueryBase} trail path`,
        `${photoQueryBase} travel spot`,
      ]
      try {
        const photoPromises = queries
          .slice(0, 5)
          .map((q) => searchPexelsImage(q, 300, 300))
        const photos = await Promise.all(photoPromises)
        setTravelerPhotos(
          photos.filter((p) => p && !p.includes('placehold.co'))
        )
      } catch (error) {
        console.error('Failed to load traveler photos:', error)
        setTravelerPhotos(
          [...Array(5)].map(() => PLACEHOLDER_IMAGE_URL(300, 300))
        )
      } finally {
        setAreTravelerPhotosLoading(false)
      }
    }

    if (initialDestination) {
      fetchDynamicImages()
    }
  }, [initialDestination])

  const handleGenerateImage = async () => {
    if (!destination) return
    setIsGeneratingImage(true)
    setGeneratedImageUrl(null)
    try {
      const result = await generateTrekImage({
        destinationName: destination.name,
        destinationDescription: destination.description,
      })
      if (result.imageDataUri) {
        setGeneratedImageUrl(result.imageDataUri)
        toast({
          title: 'AI Image Generated!',
          description: `An AI's vision of ${destination.name} is ready.`,
        })
      } else {
        throw new Error('Image data URI is missing in the response.')
      }
    } catch (error) {
      console.error('Error generating AI image:', error)
      toast({
        variant: 'destructive',
        title: 'AI Image Generation Failed',
        description: 'Could not generate an image at this time.',
      })
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleShare = async () => {
    if (!destination) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: destination.name,
          text: `Check out this amazing trek: ${
            destination.name
          }\n${destination.description.substring(0, 100)}...`,
          url: window.location.href,
        })
        toast({ title: 'Shared Successfully!' })
      } catch (error) {
        console.error('Error sharing:', error)
        let description = 'Could not share at this moment.'
        // Check if the error is a DOMException and specifically a NotAllowedError (common for permission issues)
        // or if the error message indicates permission denial.
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          description =
            'Sharing permission was denied. This often happens if the page is not served over HTTPS, or if you explicitly denied the share permission in your browser.'
        } else if (
          error instanceof Error &&
          error.message.toLowerCase().includes('permission denied')
        ) {
          description =
            "Sharing permission was denied. Please ensure the page is served over HTTPS or check your browser's site permissions."
        }

        toast({
          variant: 'destructive',
          title: 'Share Failed',
          description: description,
        })
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: 'Link Copied!',
          description:
            'Share API not available. Destination link copied to clipboard.',
        })
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Copy Failed',
          description: 'Could not copy link to clipboard.',
        })
      }
    }
  }

  const handleToggleWishlist = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to manage your wishlist.',
        action: (
          <Button
            onClick={() =>
              router.push(`/auth/signin?redirect=/explore/${destination.id}`)
            }
          >
            Sign In
          </Button>
        ),
      })
      return
    }
    if (!destination) return
    setIsWishlistProcessing(true)

    const currentWishlist = currentUser.wishlistDestinations || []
    const isWishlisted = currentWishlist.includes(destination.name)
    const newWishlist = isWishlisted
      ? currentWishlist.filter((name) => name !== destination.name)
      : [...currentWishlist, destination.name]

    try {
      await updateUserProfileClient(currentUser.id, {
        wishlistDestinations: newWishlist,
      })
      // Update local context - you might need to fetch updated user or update locally
      toast({
        title: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
        description: `${destination.name} has been ${
          isWishlisted ? 'removed from' : 'added to'
        } your wishlist.`,
      })
    } catch (error) {
      console.error('Error updating wishlist:', error)
      toast({
        variant: 'destructive',
        title: 'Wishlist Update Failed',
        description: 'Could not update wishlist.',
      })
    } finally {
      setIsWishlistProcessing(false)
    }
  }

  const isDestinationInWishlist = (): boolean => {
    if (!currentUser || !currentUser.wishlistDestinations || !destination)
      return false
    return currentUser.wishlistDestinations.includes(destination.name)
  }

  const AITag =
    destination?.aiHint ||
    destination?.name.toLowerCase().split(' ').slice(0, 2).join(' ') ||
    'trekking india'
  const mapEmbedUrl = destination?.coordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${
        destination.coordinates.lng - 0.05
      }%2C${destination.coordinates.lat - 0.05}%2C${
        destination.coordinates.lng + 0.05
      }%2C${destination.coordinates.lat + 0.05}&layer=mapnik&marker=${
        destination.coordinates.lat
      }%2C${destination.coordinates.lng}`
    : null

  if (!destination) {
    // This should ideally be handled by the page.tsx getting a null destination
    // But as a fallback within client content:
    return <div>Loading destination details or destination not found...</div>
  }

  return (
    <div className="space-y-8 container mx-auto max-w-7xl">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/explore" prefetch>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Share Destination"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={
              isDestinationInWishlist()
                ? 'Remove from Wishlist'
                : 'Add to Wishlist'
            }
            onClick={handleToggleWishlist}
            disabled={isWishlistProcessing || authIsLoading}
            className={
              isDestinationInWishlist()
                ? 'text-pink-500 border-pink-500 hover:bg-pink-500/10'
                : ''
            }
          >
            {isWishlistProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <HeartIcon
                className={`h-5 w-5 ${
                  isDestinationInWishlist() ? 'fill-pink-500' : ''
                }`}
              />
            )}
          </Button>
        </div>
      </div>

      <Card className="shadow-lg overflow-hidden">
        <div className="relative h-64 md:h-96">
          {isMainImageLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <Image
              src={mainImage}
              alt={destination.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-cover"
              priority
              data-ai-hint={AITag}
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(
                  1200,
                  600
                )
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <h1 className="font-headline text-3xl md:text-4xl text-primary-foreground mb-1">
              {destination.name}
            </h1>
            <div className="flex items-center text-lg text-primary-foreground/80">
              <MapPin className="h-5 w-5 mr-2" />
              {destination.country}
              {destination.region ? `, ${destination.region}` : ''}
            </div>
          </div>
        </div>

        <CardContent className="p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="font-headline text-2xl text-primary mb-2">
                About {destination.name}
              </h2>
              <p className="text-foreground/90 leading-relaxed">
                {destination.description}
              </p>
            </div>

            {destination.attractions && destination.attractions.length > 0 && (
              <div>
                <h3 className="font-headline text-xl mb-2">
                  Popular Attractions
                </h3>
                <ul className="list-disc list-inside space-y-1 text-foreground/80">
                  {destination.attractions.map((attraction) => (
                    <li key={attraction}>{attraction}</li>
                  ))}
                </ul>
              </div>
            )}

            {destination.travelTips && (
              <div>
                <h3 className="font-headline text-xl mb-2">Travel Tips</h3>
                <p className="text-foreground/80 italic">
                  {destination.travelTips}
                </p>
              </div>
            )}

            <div>
              <h3 className="font-headline text-xl mb-2">Route Planning</h3>
              <Button
                asChild
                variant="outline"
                className="border-accent text-accent hover:bg-accent/5"
              >
                <Link
                  href={`/explore/routes/new?destinationId=${destination.id}`}
                  prefetch
                >
                  <RouteIcon className="mr-2 h-4 w-4" /> Create Custom Route
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center">
                  <Sun className="mr-2 h-5 w-5 text-yellow-500" /> Weather
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  {getWeatherIcon(mockWeather.iconCode)}
                  <span className="ml-2 text-2xl font-semibold">
                    {mockWeather.temperature}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {mockWeather.condition}
                  </span>
                </div>
                <h4 className="font-medium text-sm mb-1">Forecast:</h4>
                <ul className="space-y-1 text-sm">
                  {mockWeather.forecast?.map((day) => (
                    <li
                      key={day.date}
                      className="flex justify-between items-center text-muted-foreground"
                    >
                      <span>
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                        })}
                        :
                      </span>
                      <div className="flex items-center">
                        {getWeatherIcon(day.iconCode)}
                        <span className="ml-1">
                          {day.minTemp} / {day.maxTemp}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-2 text-primary"
                  disabled
                >
                  View Full Forecast <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-red-500" /> Location Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mapEmbedUrl ? (
                  <div className="relative h-[200px] w-full rounded-lg overflow-hidden border">
                    <Skeleton
                      className={`absolute inset-0 transition-opacity duration-300 ${
                        isMapLoaded ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                    <iframe
                      width="100%"
                      height="200"
                      loading="lazy"
                      src={mapEmbedUrl}
                      className={`transition-opacity duration-300 ${
                        isMapLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setIsMapLoaded(true)}
                      title={`Map of ${destination.name}`}
                    ></iframe>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Map not available.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5 text-blue-500" /> Local
                  Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No upcoming events listed. Check local resources.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center">
                  <ShieldCheck className="mr-2 h-5 w-5 text-green-500" /> Safety
                  Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Emergency: 100 (Police), 108 (Ambulance)
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-1 text-primary"
                  disabled
                >
                  View More Safety Details{' '}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">
            Photos from Travelers
          </CardTitle>
          <CardDescription>
            See {destination.name} through the eyes of the community.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {areTravelerPhotosLoading
            ? [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))
            : travelerPhotos.length > 0
            ? travelerPhotos.map((photoUrl, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted rounded-lg overflow-hidden relative"
                >
                  <Image
                    src={photoUrl}
                    alt={`User photo ${i + 1} from ${destination.name}`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
                    className="object-cover"
                    data-ai-hint={`${AITag} photo ${i + 1}`}
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        PLACEHOLDER_IMAGE_URL(300, 300)
                    }}
                  />
                </div>
              ))
            : [...Array(5)].map((_, i) => (
                <div
                  key={`fallback-${i}`}
                  className="aspect-square bg-muted rounded-lg overflow-hidden relative"
                >
                  <Image
                    src={PLACEHOLDER_IMAGE_URL(300, 300)}
                    alt={`Placeholder photo ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
                    className="object-cover"
                    data-ai-hint={`${AITag} placeholder ${i + 1}`}
                  />
                </div>
              ))}
          <Button
            variant="outline"
            className="aspect-square flex flex-col items-center justify-center text-muted-foreground hover:bg-primary/5 hover:text-primary"
            disabled
          >
            <ExternalLink className="h-6 w-6 mb-1" />
            View All Photos
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
