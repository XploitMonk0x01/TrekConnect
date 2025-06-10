
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfileCard } from '@/components/UserProfileCard';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Heart, X, RotateCcw, Filter, Users, MessageSquare, Loader2, AlertTriangle } from 'lucide-react';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { getOtherUsers } from '@/services/users'; 
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConnectSpherePage() {
  const { user: currentUser, isLoading: authIsLoading } = useCustomAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [lastSwipedProfile, setLastSwipedProfile] = useState<UserProfile | null>(null);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchAnimationTimeoutId, setMatchAnimationTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [shouldReloadProfiles, setShouldReloadProfiles] = useState(false);

  useEffect(() => {
    return () => {
      if (matchAnimationTimeoutId) {
        clearTimeout(matchAnimationTimeoutId);
      }
    };
  }, [matchAnimationTimeoutId]);

  const loadProfiles = useCallback(async () => {
    if (!currentUser?.id) {
      setProfiles([]);
      setIsLoadingProfiles(false);
      return;
    }
    setIsLoadingProfiles(true);
    try {
      const fetchedProfiles = await getOtherUsers(currentUser.id);
      setProfiles(fetchedProfiles || []);
      setCurrentIndex(0); // Reset index on new profiles load
    } catch (error) {
      console.error("Failed to load profiles:", error);
      setProfiles([]);
    } finally {
      setIsLoadingProfiles(false);
    }
  }, [currentUser?.id]);

  // Initial profile load
  useEffect(() => {
    if (!authIsLoading && currentUser?.id) {
      loadProfiles();
    } else if (!authIsLoading && !currentUser) {
      // No user, clear profiles and stop loading
      setIsLoadingProfiles(false);
      setProfiles([]);
      setCurrentIndex(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, authIsLoading, loadProfiles]); // loadProfiles is memoized

  // Effect for reloading profiles when the end is reached or flag is set
  useEffect(() => {
    if (shouldReloadProfiles) {
      loadProfiles();
      setShouldReloadProfiles(false); // Reset the flag
    }
  }, [shouldReloadProfiles, loadProfiles]);

  // Effect to keep currentIndex in bounds
  useEffect(() => {
    if (profiles.length > 0 && currentIndex >= profiles.length) {
      // This case should ideally trigger a reload via shouldReloadProfiles flag
      // For now, setting to last valid index or 0 if list is empty
      setCurrentIndex(profiles.length - 1); 
    } else if (profiles.length === 0 && currentIndex !== 0) {
      setCurrentIndex(0); 
    }
  }, [profiles, currentIndex]);


  const advanceToNextProfile = () => {
    setLastSwipedProfile(null); 
    if (showMatchAnimation && matchAnimationTimeoutId) {
      clearTimeout(matchAnimationTimeoutId);
      setMatchAnimationTimeoutId(null);
      setShowMatchAnimation(false);
    }
    
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex + 1;
      if (newIndex >= profiles.length) {
        setShouldReloadProfiles(true); // Flag to reload
        return 0; // Reset to 0, reload will repopulate
      }
      return newIndex;
    });
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentUser || profiles.length === 0 || !profiles[currentIndex]) return;
    
    if (matchAnimationTimeoutId) {
        clearTimeout(matchAnimationTimeoutId);
        setMatchAnimationTimeoutId(null);
    }

    const swipedProfile = profiles[currentIndex];
    setLastSwipedProfile(swipedProfile);

    if (direction === 'right') {
      setShowMatchAnimation(true);
      const timeoutId = setTimeout(() => {
        setShowMatchAnimation(false);
        advanceToNextProfile();
        setMatchAnimationTimeoutId(null); 
      }, 2500); // Slightly longer for animation viewing
      setMatchAnimationTimeoutId(timeoutId);
    } else {
        advanceToNextProfile();
    }
  };

  const handleUndo = () => {
    if (!currentUser) return;
    if (showMatchAnimation && matchAnimationTimeoutId) { 
        clearTimeout(matchAnimationTimeoutId);
        setMatchAnimationTimeoutId(null);
        setShowMatchAnimation(false);
    }

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setLastSwipedProfile(null); 
    } else {
      // Optionally, toast "Nothing to undo"
    }
  };
  
  const currentProfileForCard = profiles.length > 0 ? profiles[currentIndex] : null;

  if (authIsLoading) { 
    return (
      <div className="flex flex-col items-center space-y-6 p-4 h-full">
        <Skeleton className="h-32 w-full max-w-md" />
        <div className="relative w-full max-w-sm h-[calc(100vh-20rem)] min-h-[480px] flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
        <div className="flex space-x-4 items-center">
          <Skeleton className="h-16 w-16 rounded-full" /><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-16 w-16 rounded-full" />
        </div>
      </div>
    );
  }

  if (!currentUser && !authIsLoading) { 
    return (
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
            <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-2xl font-semibold">ConnectSphere</h1>
            <p className="text-muted-foreground">Please sign in to connect with other trekkers.</p>
            <Button asChild className="mt-6">
              <Link href="/auth/signin?redirect=/connect">Sign In</Link>
            </Button>
        </div>
    );
  }
  
  if (isLoadingProfiles && currentUser) { 
     return (
      <div className="flex flex-col items-center space-y-6 p-4 h-full">
        <Skeleton className="h-32 w-full max-w-md" />
        <div className="relative w-full max-w-sm h-[calc(100vh-20rem)] min-h-[480px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <p className="mt-2 text-muted-foreground">Finding trekkers...</p>
          </div>
        </div>
        <div className="flex space-x-4 items-center">
          <Skeleton className="h-16 w-16 rounded-full" /><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-16 w-16 rounded-full" />
        </div>
      </div>
    );
  }


  if (showMatchAnimation && lastSwipedProfile && currentUser) {
    const currentUserPhoto = currentUser?.photoUrl || PLACEHOLDER_IMAGE_URL(100,100);
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4 bg-background">
        <Heart className="w-24 h-24 text-pink-500 animate-ping mb-4" />
        <h2 className="text-3xl font-headline text-primary">It's a Match!</h2>
        <p className="text-xl text-muted-foreground mt-2">You and {lastSwipedProfile.name || 'your match'} are interested in connecting!</p>
        <div className="flex gap-4 mt-8">
          <Image 
            src={currentUserPhoto} 
            alt="Your profile" width={100} height={100} 
            className="rounded-full border-4 border-primary object-cover" 
            data-ai-hint="person user"
            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(100,100); }}
          />
          <Image 
            src={lastSwipedProfile.photoUrl || PLACEHOLDER_IMAGE_URL(100,100)} 
            alt={lastSwipedProfile.name || 'Match'} width={100} height={100} 
            className="rounded-full border-4 border-pink-500 object-cover" 
            data-ai-hint={`person ${lastSwipedProfile.name?.split(' ')[0] || 'match'}`}
            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(100,100); }}
            />
        </div>
        <Button className="mt-8 bg-accent hover:bg-accent/90" disabled>
          <MessageSquare className="mr-2 h-5 w-5" /> Start Chatting (Soon!)
        </Button>
         <Button variant="link" className="mt-2 text-primary" onClick={() => { 
            if (matchAnimationTimeoutId) {
                clearTimeout(matchAnimationTimeoutId);
                setMatchAnimationTimeoutId(null);
            }
            setShowMatchAnimation(false); 
            advanceToNextProfile();
         }}>
          Continue Swiping
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-4 h-full">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">ConnectSphere</CardTitle>
          <CardDescription>Swipe right to connect, left to pass. Find your next Indian trek buddy!</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="outline" className="w-full sm:w-auto" disabled>
                <Filter className="mr-2 h-4 w-4" /> Filter Preferences (Soon!)
            </Button>
        </CardContent>
      </Card>

      <div className="relative w-full max-w-sm h-[calc(100vh-22rem)] min-h-[480px] flex items-center justify-center">
        {(!isLoadingProfiles && profiles.length === 0 && !shouldReloadProfiles) ? ( // Check shouldReload to avoid brief flash
           <div className="text-center p-8 bg-card rounded-xl shadow-lg">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-headline text-xl">No More Profiles</h3>
            <p className="text-muted-foreground">Check back later or adjust your filters!</p>
             <Button onClick={() => setShouldReloadProfiles(true)} className="mt-4" disabled={isLoadingProfiles || authIsLoading}>
                {isLoadingProfiles ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reload Profiles"}
            </Button>
          </div>
        ) : currentProfileForCard ? (
            <UserProfileCard user={currentProfileForCard} />
        ) : (
          <div className="text-center p-8 bg-card rounded-xl shadow-lg">
            {isLoadingProfiles || authIsLoading || shouldReloadProfiles ? ( // Show loader if actively loading
                <>
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                <p className="mt-2 text-muted-foreground">Finding trekkers...</p>
                </>
            ) : (
                <>
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-headline text-xl">No Profiles Found</h3>
                <p className="text-muted-foreground">Try reloading or check back later.</p>
                <Button onClick={() => setShouldReloadProfiles(true)} className="mt-4" disabled={isLoadingProfiles || authIsLoading}>
                    "Reload Profiles"
                </Button>
                </>
            )}
          </div>
        )}
      </div>

      {currentProfileForCard && (
        <div className="flex space-x-4 items-center">
          <Button variant="outline" size="lg" className="rounded-full p-4 border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleSwipe('left')} aria-label="Pass">
            <X className="h-8 w-8" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full p-2 border-muted-foreground text-muted-foreground hover:bg-muted-foreground/10" onClick={handleUndo} aria-label="Undo" disabled={currentIndex === 0 && !lastSwipedProfile}>
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="rounded-full p-4 border-green-500 text-green-500 hover:bg-green-500/10" onClick={() => handleSwipe('right')} aria-label="Connect">
            <Heart className="h-8 w-8" />
          </Button>
        </div>
      )}
    </div>
  );
}
    