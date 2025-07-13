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
  const [matchAnimationTimeoutId, setMatchAnimationTimeoutId] =
    useState<NodeJS.Timeout | null>(null)
  const [shouldReloadProfiles, setShouldReloadProfiles] = useState(false)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (matchAnimationTimeoutId) {
        clearTimeout(matchAnimationTimeoutId)
      }
    }
  }, [matchAnimationTimeoutId])

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
      const validProfiles = fetchedProfiles.filter(p => p && p.id && p.name);
      setProfiles(validProfiles || [])
      setCurrentIndex(0)
    } catch (error) {
      console.error('Failed to load profiles:', error)
      toast({
        variant: 'destructive',
        title: 'Error Loading Profiles',
        description: 'Could not fetch trekker profiles. Please try again later.',
      });
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
    if (showMatchAnimation && matchAnimationTimeoutId) {
      clearTimeout(matchAnimationTimeoutId)
      setMatchAnimationTimeoutId(null)
    }
    setShowMatchAnimation(false)
    setLastSwipedProfile(null)
    
    setCurrentIndex((prevIndex) => prevIndex + 1)
  }

  // Check if we need to reload profiles when we run out
  useEffect(() => {
    if (!isLoadingProfiles && profiles.length > 0 && currentIndex >= profiles.length) {
      setShouldReloadProfiles(true);
      setCurrentIndex(0);
    }
  }, [currentIndex, profiles.length, isLoadingProfiles]);


  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentUser || profiles.length === 0 || !profiles[currentIndex]) return

    // Haptic feedback (if available)
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    if (matchAnimationTimeoutId) {
      clearTimeout(matchAnimationTimeoutId)
    }

    const swipedProfile = profiles[currentIndex]
    setLastSwipedProfile(swipedProfile)

    if (direction === 'right') {
      setShowMatchAnimation(true)
      const timeoutId = setTimeout(() => {
        advanceToNextProfile()
      }, 3500) // Extended to allow clicking chat button
      setMatchAnimationTimeoutId(timeoutId)
    } else {
      advanceToNextProfile()
    }
  }

  const handleUndo = () => {
    if (!currentUser || currentIndex === 0) return;
    if (showMatchAnimation && matchAnimationTimeoutId) {
      clearTimeout(matchAnimationTimeoutId)
      setShowMatchAnimation(false)
    }
    setCurrentIndex(currentIndex - 1)
    setLastSwipedProfile(null)
  }

  const handleStartChat = (matchProfileId: string) => {
    if (matchAnimationTimeoutId) {
      clearTimeout(matchAnimationTimeoutId) // Clear the auto-advance timeout
    }
    setShowMatchAnimation(false) // Hide match animation
    router.push(`/chat/${matchProfileId}`)
  }
  
  const currentProfileForCard =
    !isLoadingProfiles && profiles.length > 0 && currentIndex < profiles.length
      ? profiles[currentIndex]
      : null

  if (authIsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-6 p-4 h-full">
          <Skeleton className="h-32 w-full max-w-md" />
          <div className="relative w-full max-w-sm h-[calc(100vh-20rem)] min-h-[480px] flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <div className="flex space-x-4 items-center">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertTriangle className="w-12 h-12 text-yellow-500" />
          <h2 className="text-2xl font-semibold">Authentication Required</h2>
          <p className="text-gray-600 text-center">
            Please sign in to access the Connect feature
          </p>
          <Button onClick={() => router.push('/auth/signin?redirect=/connect')} className="mt-4">
            Sign In
          </Button>
        </div>
      </div>
    )
  }


  if (showMatchAnimation && lastSwipedProfile && currentUser) {
    const currentUserPhoto =
      currentUser?.photoUrl || PLACEHOLDER_IMAGE_URL(100, 100)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center p-4 bg-background">
          <Heart className="w-24 h-24 text-pink-500 animate-ping mb-4" />
          <h2 className="text-3xl font-headline text-primary">It's a Match!</h2>
          <p className="text-xl text-muted-foreground mt-2">
            You and {lastSwipedProfile.name || 'your match'} are interested in
            connecting!
          </p>
          <div className="flex gap-4 mt-8">
            <Image
              src={currentUserPhoto}
              alt="Your profile"
              width={100}
              height={100}
              className="rounded-full border-4 border-primary object-cover"
              data-ai-hint="person user"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(
                  100,
                  100
                )
              }}
            />
            <Image
              src={
                lastSwipedProfile.photoUrl || PLACEHOLDER_IMAGE_URL(100, 100)
              }
              alt={lastSwipedProfile.name || 'Match'}
              width={100}
              height={100}
              className="rounded-full border-4 border-pink-500 object-cover"
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center space-y-6 p-4 h-full">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-primary">
              ConnectSphere
            </CardTitle>
            <CardDescription>
              Swipe right to connect, left to pass. Find your next Indian trek
              buddy!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full sm:w-auto" disabled>
              <Filter className="mr-2 h-4 w-4" /> Filter Preferences (Soon!)
            </Button>
          </CardContent>
        </Card>

        <div className="relative w-full max-w-sm h-[calc(100vh-22rem)] min-h-[480px] flex items-center justify-center">
          <AnimatePresence>
            {isLoadingProfiles ? (
                 <div className="text-center p-8 bg-card rounded-xl shadow-lg">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                    <p className="mt-2 text-muted-foreground">Finding trekkers...</p>
                 </div>
            ) : profiles.length > 0 && currentIndex < profiles.length ? (
                profiles.slice(currentIndex, currentIndex + 3).reverse().map((profile, index) => {
                    const isTop = index === (profiles.slice(currentIndex, currentIndex + 3).length - 1);
                    return (
                        <motion.div
                            key={profile.id}
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ 
                                scale: 1 - (profiles.slice(currentIndex, currentIndex + 3).length - 1 - index) * 0.05, 
                                y: (profiles.slice(currentIndex, currentIndex + 3).length - 1 - index) * -8, 
                                opacity: 1 
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
                    );
                })
            ) : (
                <div className="text-center p-8 bg-card rounded-xl shadow-lg">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-headline text-xl">No More Profiles</h3>
                    <p className="text-muted-foreground">Check back later or adjust your filters!</p>
                    <Button onClick={() => setShouldReloadProfiles(true)} className="mt-4" disabled={isLoadingProfiles || authIsLoading}>
                        {isLoadingProfiles ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : ('Reload Profiles')}
                    </Button>
                </div>
            )}
           </AnimatePresence>
        </div>
        
        {currentProfileForCard && (
          <div className="flex space-x-4 items-center">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full p-4 border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => handleSwipe('left')}
                aria-label="Pass"
              >
                <X className="h-8 w-8" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full p-2 border-muted-foreground text-muted-foreground hover:bg-muted-foreground/10"
                onClick={handleUndo}
                aria-label="Undo"
                disabled={currentIndex === 0}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full p-4 border-green-500 text-green-500 hover:bg-green-500/10"
                onClick={() => handleSwipe('right')}
                aria-label="Connect"
              >
                <Heart className="h-8 w-8" />
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
