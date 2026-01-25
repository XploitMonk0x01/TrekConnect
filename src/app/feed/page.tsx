'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PhotoCard } from '@/components/PhotoCard'
import type { Photo } from '@/lib/types'
import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { getPaginatedPhotos } from '@/services/photos'
import { useCustomAuth } from '@/contexts/CustomAuthContext'

const PHOTOS_PER_PAGE = 12

export default function PhotoFeedPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, isLoading: authLoading } = useCustomAuth()

  const fetchPhotos = useCallback(async (cursor?: string) => {
    try {
      const result = await getPaginatedPhotos(PHOTOS_PER_PAGE, cursor)
      return result
    } catch (err) {
      console.error('Error fetching photos:', err)
      throw err
    }
  }, [])

  useEffect(() => {
    async function loadInitialPhotos() {
      if (authLoading) return

      if (!user) {
        setError('Please sign in to view photos')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const result = await fetchPhotos()
        setPhotos(result.photos)
        setHasMore(result.hasMore)
      } catch (err) {
        setError('Failed to load photos. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialPhotos()
  }, [user, authLoading, fetchPhotos])

  const handleLoadMore = async () => {
    if (photos.length === 0 || isLoadingMore) return

    const lastPhoto = photos[photos.length - 1]
    setIsLoadingMore(true)

    try {
      const result = await fetchPhotos(lastPhoto.uploadedAt)
      setPhotos((prev) => [...prev, ...result.photos])
      setHasMore(result.hasMore)
    } catch (err) {
      console.error('Error loading more photos:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg">Loading photos...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-8 container mx-auto max-w-7xl">
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Authentication Required
            </h3>
            <p className="text-muted-foreground mb-4">
              Please sign in to view and share photos with the community.
            </p>
            <Button asChild>
              <Link href="/auth/signin?redirect=/feed">
                Sign In to Continue
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8 container mx-auto max-w-7xl">
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Photos</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 container mx-auto max-w-7xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <ImageIcon className="mr-3 h-8 w-8" /> Photo Feed
          </CardTitle>
          <CardDescription>
            Share your Indian trek adventures and get inspired by the community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <Button
              asChild
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Link href="/feed/upload">
                <UploadCloud className="mr-2 h-5 w-5" /> Upload Photo
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Photo Feed is Empty</h3>
            <p className="text-muted-foreground">
              No photos have been shared yet. Be the first to share your
              adventure or check back later!
            </p>
          </CardContent>
        </Card>
      )}

      {photos.length > 0 && hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Photos'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
