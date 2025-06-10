
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfileCard } from '@/components/UserProfileCard';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Heart, X, RotateCcw, Filter, Users, MessageSquare, Loader2, AlertTriangle } from 'lucide-react';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { getOtherUsers } from '@/services/users'; 
// Removed useAuth
import { Skeleton } from '@/components/ui/skeleton';

export default function ConnectSpherePage() {
  // const { user: currentUser, loading: authLoading } = useAuth(); // Removed
  // Simulate auth state for now
  const currentUser = null; // Placeholder for current user from custom auth
  const authLoading = false; // Placeholder

  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [lastSwipedProfile, setLastSwipedProfile] = useState<UserProfile | null>(null);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);

  const loadProfiles = async () => {
    // if (!currentUser) { // currentUser from custom auth
    //   setProfiles([]);
    //   setIsLoadingProfiles(false);
    //   return;
    // }
    setIsLoadingProfiles(true);
    try {
      // Pass current user's ID from custom auth if needed by getOtherUsers
      // const currentUserId = currentUser?.id; 
      // const fetchedProfiles = await getOtherUsers(currentUserId || ''); 
      const fetchedProfiles = await getOtherUsers("dummyCurrentUserId"); // Placeholder
      setProfiles(fetchedProfiles || []);
    } catch (error) {
      console.error("Failed to load profiles:", error);
      setProfiles([]);
    } finally {
      setIsLoadingProfiles(false);
      setCurrentIndex(0); 
      setLastSwipedProfile(null);
    }
  };

  useEffect(() => {
    if (!authLoading && currentUser) { // currentUser from custom auth
      loadProfiles();
    } else if (!authLoading && !currentUser) {
      setIsLoadingProfiles(false);
      setProfiles([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, authLoading]);


  const handleSwipe = (direction: 'left' | 'right') => {
    if (!profiles[currentIndex]) return;
    // Custom auth: Check if user is logged in before swiping
    // if (!currentUser) { /* show login prompt */ return; }


    const swipedProfile = profiles[currentIndex];
    setLastSwipedProfile(swipedProfile);

    if (direction === 'right') {
      console.log(`Matched with ${swipedProfile.name}`);
      // TODO: Implement actual match logic (e.g., save to DB) with custom auth user ID
      setShowMatchAnimation(true);
      setTimeout(() => {
        setShowMatchAnimation(false);
        if (currentIndex < profiles.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            console.log("No more profiles to swipe.");
        }
      }, 2000); 
    } else {
        if (currentIndex < profiles.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
             console.log("No more profiles to swipe.");
        }
    }
  };

  const handleUndo = () => {
    // Custom auth: Check if user is logged in
    if (currentIndex > 0) {
      if (showMatchAnimation) setShowMatchAnimation(false);
      setCurrentIndex(currentIndex - 1);
      console.log("Undo last swipe to show profile:", profiles[currentIndex - 1]?.name);
      setLastSwipedProfile(null);
    } else {
      console.log("Nothing to undo or already at the beginning.");
    }
  };
  
  const currentProfile = profiles[currentIndex];

  if (authLoading) { // authLoading from custom auth
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

  if (!currentUser && !authLoading) { // currentUser from custom auth
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
  
  if (isLoadingProfiles && currentUser) { // Show loader only if user is "logged in"
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


  if (showMatchAnimation && lastSwipedProfile) {
    const currentUserPhoto = currentUser && (currentUser as any).photoUrl ? (currentUser as any).photoUrl : PLACEHOLDER_IMAGE_URL(100,100);
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4 bg-background">
        <Heart className="w-24 h-24 text-pink-500 animate-ping mb-4" />
        <h2 className="text-3xl font-headline text-primary">It's a Match!</h2>
        <p className="text-xl text-muted-foreground mt-2">You and {lastSwipedProfile.name} are interested in connecting!</p>
        <div className="flex gap-4 mt-8">
          <Image 
            src={currentUserPhoto} 
            alt="Your profile" width={100} height={100} 
            className="rounded-full border-4 border-primary" 
            data-ai-hint="person user"
            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(100,100); }}
          />
          <Image 
            src={lastSwipedProfile.photoUrl || PLACEHOLDER_IMAGE_URL(100,100)} 
            alt={lastSwipedProfile.name || 'Match'} width={100} height={100} 
            className="rounded-full border-4 border-pink-500" 
            data-ai-hint={`person ${lastSwipedProfile.name?.split(' ')[0] || 'match'}`}
            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(100,100); }}
            />
        </div>
        <Button className="mt-8 bg-accent hover:bg-accent/90" onClick={() => setShowMatchAnimation(false)} disabled>
          <MessageSquare className="mr-2 h-5 w-5" /> Start Chatting (Soon!)
        </Button>
         <Button variant="link" className="mt-2 text-primary" onClick={() => { 
            setShowMatchAnimation(false); 
            if (currentIndex < profiles.length -1 ) { /* Handled by swipe logic */ }
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
        {currentProfile ? (
            <UserProfileCard user={currentProfile} />
        ) : (
          <div className="text-center p-8 bg-card rounded-xl shadow-lg">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-headline text-xl">No More Profiles</h3>
            <p className="text-muted-foreground">Check back later or adjust your filters!</p>
             <Button onClick={loadProfiles} className="mt-4" disabled={isLoadingProfiles}>
                {isLoadingProfiles ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reload Profiles"}
            </Button>
          </div>
        )}
      </div>

      {currentProfile && (
        <div className="flex space-x-4 items-center">
          <Button variant="outline" size="lg" className="rounded-full p-4 border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleSwipe('left')} aria-label="Pass">
            <X className="h-8 w-8" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full p-2 border-muted-foreground text-muted-foreground hover:bg-muted-foreground/10" onClick={handleUndo} aria-label="Undo" disabled={currentIndex === 0}>
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
