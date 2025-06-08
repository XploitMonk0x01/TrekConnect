'use client'; // Required for react-swipeable-cards or similar interactivity

import { useState } from 'react';
import { UserProfileCard } from '@/components/UserProfileCard';
import type { UserProfile, Badge as BadgeType, PlannedTrip } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Heart, X, RotateCcw, Filter, Users, MessageSquare } from 'lucide-react';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

const mockBadgeExperienced: BadgeType = { id: 'b1', name: 'Seasoned Trekker', description: 'Completed 10+ treks' };
const mockBadgeExplorer: BadgeType = { id: 'b2', name: 'Explorer', description: 'Visited 5+ countries' };
const mockBadgePhotographer: BadgeType = { id: 'b3', name: 'Photographer', description: 'Shared 50+ photos' };

const mockPlannedTrip1: PlannedTrip = { id: 'pt1', destinationId: '1', destinationName: 'Everest Base Camp', startDate: '2024-09-15', endDate: '2024-09-30' };
const mockPlannedTrip2: PlannedTrip = { id: 'pt2', destinationId: '2', destinationName: 'Patagonia Wilderness', startDate: '2024-11-01', endDate: '2024-11-20' };

const mockUsers: UserProfile[] = [
  { id: "u1", name: "Alice", age: 28, gender: "Female", photoUrl: PLACEHOLDER_IMAGE_URL(400,400) + "?text=Alice", bio: "Loves mountains and long hikes. Looking for a trekking buddy for Nepal.", travelPreferences: { soloOrGroup: "Flexible", budget: "Mid-range" }, languagesSpoken: ["English", "Spanish"], trekkingExperience: "Intermediate", plannedTrips: [mockPlannedTrip1], badges: [mockBadgeExperienced] },
  { id: "u2", name: "Bob", age: 32, gender: "Male", photoUrl: PLACEHOLDER_IMAGE_URL(400,400) + "?text=Bob", bio: "Photographer and nature enthusiast. Planning a trip to Patagonia.", travelPreferences: { soloOrGroup: "Solo", budget: "Budget" }, languagesSpoken: ["English", "German"], trekkingExperience: "Advanced", plannedTrips: [mockPlannedTrip2], badges: [mockBadgePhotographer, mockBadgeExplorer] },
  { id: "u3", name: "Carol", age: 25, gender: "Female", photoUrl: PLACEHOLDER_IMAGE_URL(400,400) + "?text=Carol", bio: "Beginner trekker, excited to explore scenic trails. Prefers group travel.", travelPreferences: { soloOrGroup: "Group", budget: "Mid-range" }, languagesSpoken: ["English"], trekkingExperience: "Beginner", plannedTrips: [mockPlannedTrip1], badges: [] },
  { id: "u4", name: "David", age: 30, gender: "Male", photoUrl: PLACEHOLDER_IMAGE_URL(400,400) + "?text=David", bio: "Enjoys cultural experiences alongside trekking. Fluent in French.", travelPreferences: { soloOrGroup: "Flexible", budget: "Luxury" }, languagesSpoken: ["English", "French"], trekkingExperience: "Intermediate", plannedTrips: [mockPlannedTrip2], badges: [mockBadgeExplorer] },
];


export default function ConnectSpherePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState(mockUsers);
  const [lastSwipedProfile, setLastSwipedProfile] = useState<UserProfile | null>(null);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);

  const handleSwipe = (direction: 'left' | 'right') => {
    // Simulate match on right swipe for demo
    if (direction === 'right' && profiles[currentIndex]) {
      console.log(`Matched with ${profiles[currentIndex].name}`);
      // In a real app, send this to backend
      setLastSwipedProfile(profiles[currentIndex]); // Keep track for potential "undo"
      setShowMatchAnimation(true);
      setTimeout(() => setShowMatchAnimation(false), 2000); // Hide animation after 2s
    } else if (profiles[currentIndex]) {
      setLastSwipedProfile(profiles[currentIndex]);
    }
    
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reached end of profiles, maybe show a message or reload
      console.log("No more profiles");
      // For demo, loop back
      // setCurrentIndex(0); 
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0 && lastSwipedProfile) { // Ensure there's something to undo
      // In a real app, this would be more complex (e.g., premium feature)
      // For demo, just go back one step
      setCurrentIndex(currentIndex - 1);
      // Potentially reset the profile to the `profiles` array if it was removed on swipe
      setLastSwipedProfile(null); // Clear last swiped after undo
      console.log("Undo last swipe");
    } else {
      console.log("Nothing to undo or already at the beginning.");
    }
  };
  
  const currentProfile = profiles[currentIndex];

  if (showMatchAnimation && lastSwipedProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Heart className="w-24 h-24 text-pink-500 animate-ping mb-4" />
        <h2 className="text-3xl font-headline text-primary">It's a Match!</h2>
        <p className="text-xl text-muted-foreground mt-2">You and {lastSwipedProfile.name} are interested in connecting!</p>
        <div className="flex gap-4 mt-8">
          <Image src={PLACEHOLDER_IMAGE_URL(100,100) + "?text=You"} alt="Your profile" width={100} height={100} className="rounded-full border-4 border-primary" data-ai-hint="person avatar"/>
          <Image src={lastSwipedProfile.photoUrl} alt={lastSwipedProfile.name} width={100} height={100} className="rounded-full border-4 border-pink-500" data-ai-hint="person avatar"/>
        </div>
        <Button className="mt-8 bg-accent hover:bg-accent/90" onClick={() => setShowMatchAnimation(false)}>
          <MessageSquare className="mr-2 h-5 w-5" /> Start Chatting (Soon!)
        </Button>
         <Button variant="link" className="mt-2 text-primary" onClick={() => { setShowMatchAnimation(false); if (currentIndex < profiles.length -1 ) setCurrentIndex(currentIndex + 1); else console.log("No more profiles"); }}>
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
          <CardDescription>Swipe right to connect, left to pass. Find your next travel buddy!</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Filter Preferences
            </Button>
        </CardContent>
      </Card>

      <div className="relative w-full max-w-sm h-[calc(100vh-20rem)] min-h-[480px] flex items-center justify-center">
        {/* This is where a swipeable card component would go. For now, simple display: */}
        {currentProfile ? (
            <UserProfileCard user={currentProfile} />
        ) : (
          <div className="text-center p-8 bg-card rounded-xl shadow-lg">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-headline text-xl">No More Profiles</h3>
            <p className="text-muted-foreground">You've seen everyone for now. Check back later or adjust your filters!</p>
             <Button onClick={() => {setProfiles(mockUsers); setCurrentIndex(0);}} className="mt-4">Reload Profiles</Button>
          </div>
        )}
      </div>

      {currentProfile && (
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
