'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SwipeableCard } from '@/components/SwipeableCard'
import type { UserProfile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import {
  Heart,
  X,
  RotateCcw,
  Filter,
  Users,
  MessageSquare,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { getOtherUsers } from '@/services/users'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

export default function ConnectSpherePage() {
  const { user: currentUser, isLoading: authIsLoading } = useCustomAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true)
  const [lastSwipedProfile, setLastSwipedProfile] =
    useState<UserProfile | null>(null)
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)
  const matchAnimationTimeoutId = useRef<NodeJS.Timeout | null>(null)
  const [shouldReloadProfiles, setShouldReloadProfiles] = useState(false)
  const lastPrefetchedChatId = useRef<string | null>(null)

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timeoutId = matchAnimationTimeoutId.current
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  const loadProfiles = useCallback(async () => {
    if (!currentUser?.id) {
      setProfiles([])
      setIsLoadingProfiles(false)
      setCurrentIndex(0)
      return
    }
    setIsLoadingProfiles(true)
    try {
      const fetchedProfiles = await getOtherUsers(currentUser.id)
      // Basic profile validation
      const validProfiles = fetchedProfiles.filter((p) => p && p.id && p.name)
      setProfiles(validProfiles || [])
      setCurrentIndex(0)
    } catch (error) {
      console.error('Failed to load profiles:', error)
      toast({
        variant: 'destructive',
        title: 'Error Loading Profiles',
        description:
          'Could not fetch trekker profiles. Please try again later.',
      })
      setProfiles([])
    } finally {
      setIsLoadingProfiles(false)
    }
  }, [currentUser?.id, toast])

  useEffect(() => {
    if (!authIsLoading && currentUser?.id) {
      loadProfiles()
    } else if (!authIsLoading && !currentUser) {
      setIsLoadingProfiles(false)
      setProfiles([])
      setCurrentIndex(0)
    }
  }, [currentUser?.id, authIsLoading, loadProfiles])

  useEffect(() => {
    if (shouldReloadProfiles) {
      loadProfiles()
      setShouldReloadProfiles(false)
    }
  }, [shouldReloadProfiles, loadProfiles])

  const advanceToNextProfile = () => {
    if (showMatchAnimation && matchAnimationTimeoutId.current) {
      clearTimeout(matchAnimationTimeoutId.current)
      matchAnimationTimeoutId.current = null
    }
    setShowMatchAnimation(false)
    setLastSwipedProfile(null)

    setCurrentIndex((prevIndex) => prevIndex + 1)
  }

  // Check if we need to reload profiles when we run out
  useEffect(() => {
    if (
      !isLoadingProfiles &&
      profiles.length > 0 &&
      currentIndex >= profiles.length
    ) {
      setShouldReloadProfiles(true)
      setCurrentIndex(0)
    }
  }, [currentIndex, profiles.length, isLoadingProfiles])

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentUser || profiles.length === 0 || !profiles[currentIndex]) return

    // Haptic feedback (if available)
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    if (matchAnimationTimeoutId.current) {
      clearTimeout(matchAnimationTimeoutId.current)
    }

    const swipedProfile = profiles[currentIndex]
    setLastSwipedProfile(swipedProfile)

    if (direction === 'right') {
      // Show match animation briefly then immediately open chat
      setShowMatchAnimation(true)

      // Prefill chat user payload in sessionStorage for instant hydration on chat page
      try {
        const prefill = {
          id: swipedProfile.id,
          name: swipedProfile.name,
          photoUrl: swipedProfile.photoUrl || null,
        }
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            `chat_prefill_${swipedProfile.id}`,
            JSON.stringify(prefill)
          )
        }
      } catch {}

      // Prefetch the chat route to make navigation instantaneous
      try {
        router.prefetch?.(`/chat/${swipedProfile.id}`)
      } catch {}

      // Open chat immediately after brief animation
      const timeoutId = setTimeout(() => {
        setShowMatchAnimation(false)
        router.push(`/chat/${swipedProfile.id}`)
      }, 1500) // Reduced from 3500 to 1500ms for quicker transition
      matchAnimationTimeoutId.current = timeoutId
    } else {
      advanceToNextProfile()
    }
  }

  const handleUndo = () => {
    if (!currentUser || currentIndex === 0) return
    if (showMatchAnimation && matchAnimationTimeoutId.current) {
      clearTimeout(matchAnimationTimeoutId.current)
      setShowMatchAnimation(false)
    }
    setCurrentIndex(currentIndex - 1)
    setLastSwipedProfile(null)
  }

  const handleStartChat = (matchProfileId: string) => {
    if (matchAnimationTimeoutId.current) {
      clearTimeout(matchAnimationTimeoutId.current) // Clear the auto-advance timeout
    }
    // Prefill chat user payload in sessionStorage for instant hydration on chat page
    try {
      const matchProfile =
        profiles.find((p) => p.id === matchProfileId) || lastSwipedProfile
      if (matchProfile) {
        const prefill = {
          id: matchProfile.id,
          name: matchProfile.name,
          photoUrl: matchProfile.photoUrl || null,
        }
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            `chat_prefill_${matchProfile.id}`,
            JSON.stringify(prefill)
          )
        }
      }
    } catch {}

    // Prefetch the chat route to make navigation instantaneous
    try {
      router.prefetch?.(`/chat/${matchProfileId}`)
    } catch {}

    setShowMatchAnimation(false) // Hide match animation
    router.push(`/chat/${matchProfileId}`)
  }

  const currentProfileForCard =
    !isLoadingProfiles && profiles.length > 0 && currentIndex < profiles.length
      ? profiles[currentIndex]
      : null

  // Prefetch chat route and prefill data for the visible profile to make chat entry instant
  useEffect(() => {
    if (!currentProfileForCard) return
    const id = currentProfileForCard.id
    if (!id || lastPrefetchedChatId.current === id) return
    try {
      const prefill = {
        id,
        name: currentProfileForCard.name,
        photoUrl: currentProfileForCard.photoUrl || null,
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`chat_prefill_${id}`, JSON.stringify(prefill))
      }
      router.prefetch?.(`/chat/${id}`)
      lastPrefetchedChatId.current = id
    } catch {}
  }, [currentProfileForCard, router])

  const ConnectPageSkeleton = () => (
    <div className="space-y-8 container mx-auto max-w-7xl">
      {/* Header Skeleton */}
      <Card className="shadow-lg">
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar Skeleton */}
        <div className="lg:col-span-1 space-y-6">
          {/* "How it works" card skeleton */}
          <Skeleton className="h-48 w-full rounded-lg" />
          {/* "Progress" card skeleton */}
          <Skeleton className="h-36 w-full rounded-lg" />
        </div>
        {/* Main Card Swiper Skeleton */}
        <div className="lg:col-span-2">
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              {/* This matches the h-[600px] of the card stack */}
              <Skeleton className="relative h-[600px] w-full rounded-2xl" />
              {/* Control Buttons Skeleton */}
              <div className="flex justify-center mt-6">
                <div className="flex space-x-4 items-center">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-16 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (authIsLoading) {
    return <ConnectPageSkeleton />
  }

  if (!currentUser) {
    return (
      <div className="space-y-8 container mx-auto max-w-7xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to access the Connect feature
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/auth/signin?redirect=/connect')}
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (showMatchAnimation && lastSwipedProfile && currentUser) {
    const currentUserPhoto =
      currentUser?.photoUrl || PLACEHOLDER_IMAGE_URL(100, 100)
    return (
      <div className="space-y-8 container mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center p-4 bg-background">
          <Heart className="w-24 h-24 text-pink-500 animate-ping mb-4" />
          <h2 className="text-3xl font-headline text-primary">It's a Match!</h2>
          <p className="text-xl text-muted-foreground mt-2">
            You and {lastSwipedProfile.name || 'your match'} are interested in
            connecting!
          </p>
          <div className="flex gap-4 mt-8">
            <div className="relative h-24 w-24 rounded-full border-4 border-primary overflow-hidden">
              <Image
                src={currentUserPhoto}
                alt="Your profile"
                fill
                sizes="96px"
                className="object-cover"
                data-ai-hint="person user"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(
                    100,
                    100
                  )
                }}
              />
            </div>
            <div className="relative h-24 w-24 rounded-full border-4 border-pink-500 overflow-hidden">
              <Image
                src={
                  lastSwipedProfile.photoUrl || PLACEHOLDER_IMAGE_URL(100, 100)
                }
                alt={lastSwipedProfile.name || 'Match'}
                fill
                sizes="96px"
                className="object-cover"
                data-ai-hint={`person ${
                  lastSwipedProfile.name?.split(' ')[0] || 'match'
                }`}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(
                    100,
                    100
                  )
                }}
              />
            </div>
          </div>
          <Button
            className="mt-8 bg-accent hover:bg-accent/90"
            onClick={() => handleStartChat(lastSwipedProfile.id)}
          >
            <MessageSquare className="mr-2 h-5 w-5" /> Start Chatting
          </Button>
          <Button
            variant="link"
            className="mt-2 text-primary"
            onClick={advanceToNextProfile}
          >
            Continue Swiping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 container mx-auto max-w-7xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">
            ConnectSphere
          </CardTitle>
          <CardDescription>
            Find your next trekking companion. Swipe right to connect!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" disabled>
              <Filter className="mr-2 h-4 w-4" />
              Filters (Soon!)
            </Button>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{profiles.length} trekkers available</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar - Instructions & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Swipe Right</p>
                  <p className="text-xs text-muted-foreground">To connect</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Swipe Left</p>
                  <p className="text-xs text-muted-foreground">To pass</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Undo</p>
                  <p className="text-xs text-muted-foreground">Go back one</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Viewed:</span>
                  <span className="font-medium">
                    {currentIndex} / {profiles.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        profiles.length > 0
                          ? (currentIndex / profiles.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="relative h-[600px] flex items-center justify-center">
                <AnimatePresence>
                  {isLoadingProfiles ? (
                    <div className="text-center p-8 bg-card rounded-xl shadow-lg w-full">
                      <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                      <p className="mt-4 text-muted-foreground">
                        Finding trekkers...
                      </p>
                    </div>
                  ) : profiles.length > 0 && currentIndex < profiles.length ? (
                    profiles
                      .slice(currentIndex, currentIndex + 3)
                      .reverse()
                      .map((profile, index) => {
                        const isTop =
                          index ===
                          profiles.slice(currentIndex, currentIndex + 3)
                            .length -
                            1
                        return (
                          <motion.div
                            key={profile.id}
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{
                              scale:
                                1 -
                                (profiles.slice(currentIndex, currentIndex + 3)
                                  .length -
                                  1 -
                                  index) *
                                  0.05,
                              y:
                                (profiles.slice(currentIndex, currentIndex + 3)
                                  .length -
                                  1 -
                                  index) *
                                -8,
                              opacity: 1,
                            }}
                            exit={{ x: 300, opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="absolute w-full h-full"
                          >
                            <SwipeableCard
                              user={profile}
                              onSwipe={handleSwipe}
                              isActive={isTop}
                            />
                          </motion.div>
                        )
                      })
                  ) : (
                    <div className="text-center p-8 bg-card rounded-xl shadow-lg">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-headline text-xl">
                        No More Profiles
                      </h3>
                      <p className="text-muted-foreground">
                        Check back later or adjust your filters!
                      </p>
                      <Button
                        onClick={() => setShouldReloadProfiles(true)}
                        className="mt-4"
                        disabled={isLoadingProfiles || authIsLoading}
                      >
                        {isLoadingProfiles ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          'Reload Profiles'
                        )}
                      </Button>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {currentProfileForCard && (
                <div className="flex justify-center mt-4">
                  <div className="flex space-x-4 items-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full p-4 border-destructive text-destructive hover:bg-destructive/10 shadow-lg"
                        onClick={() => handleSwipe('left')}
                        aria-label="Pass"
                      >
                        <X className="h-8 w-8" />
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full p-3 border-muted-foreground text-muted-foreground hover:bg-muted-foreground/10 shadow-lg"
                        onClick={handleUndo}
                        aria-label="Undo"
                        disabled={currentIndex === 0}
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full p-4 border-green-500 text-green-500 hover:bg-green-500/10 shadow-lg"
                        onClick={() => handleSwipe('right')}
                        aria-label="Connect"
                      >
                        <Heart className="h-8 w-8" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
