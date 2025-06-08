
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UserProfileCard } from '@/components/UserProfileCard';
import type { UserProfile, Badge as BadgeType, PlannedTrip } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Heart, X, RotateCcw, Filter, Users, MessageSquare } from 'lucide-react';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

const mockBadgeHimalayan: BadgeType = { id: 'b1', name: 'Himalayan Explorer', description: 'Completed 3+ Himalayan treks' };
const mockBadgeUttarakhand: BadgeType = { id: 'b2', name: 'Uttarakhand Voyager', description: 'Explored treks in Uttarakhand' };
const mockBadgeHimachal: BadgeType = { id: 'b3', name: 'Himachal Hiker', description: 'Trekking enthusiast in Himachal' };

const mockPlannedTripRoopkund: PlannedTrip = { id: 'pt_in1', destinationId: 'in1', destinationName: 'Roopkund Trek, Uttarakhand', startDate: '2024-09-10', endDate: '2024-09-20' };
const mockPlannedTripHampta: PlannedTrip = { id: 'pt_in2', destinationId: 'in2', destinationName: 'Hampta Pass, Himachal', startDate: '2024-10-05', endDate: '2024-10-12' };
const mockPlannedTripValley: PlannedTrip = { id: 'pt_in3', destinationId: 'in3', destinationName: 'Valley of Flowers, Uttarakhand', startDate: '2024-08-15', endDate: '2024-08-22' };

const mockUsers: UserProfile[] = [
  { id: "u1_in", name: "Aditi", age: 27, gender: "Female", photoUrl: PLACEHOLDER_IMAGE_URL(400,400), bio: "Loves high altitude treks in Uttarakhand. Planning Roopkund next!", travelPreferences: { soloOrGroup: "Group", budget: "Mid-range" }, languagesSpoken: ["Hindi", "English"], trekkingExperience: "Intermediate", plannedTrips: [mockPlannedTripRoopkund], badges: [mockBadgeUttarakhand] },
  { id: "u2_in", name: "Karan", age: 30, gender: "Male", photoUrl: PLACEHOLDER_IMAGE_URL(400,400), bio: "Exploring Himachal one trek at a time. Hampta Pass is on the list.", travelPreferences: { soloOrGroup: "Flexible", budget: "Budget" }, languagesSpoken: ["English", "Hindi", "Punjabi"], trekkingExperience: "Advanced", plannedTrips: [mockPlannedTripHampta], badges: [mockBadgeHimachal, mockBadgeHimalayan] },
  { id: "u3_in", name: "Priya", age: 24, gender: "Female", photoUrl: PLACEHOLDER_IMAGE_URL(400,400), bio: "New to trekking, excited for Valley of Flowers. Prefers guided group tours.", travelPreferences: { soloOrGroup: "Group", budget: "Mid-range" }, languagesSpoken: ["English", "Hindi"], trekkingExperience: "Beginner", plannedTrips: [mockPlannedTripValley], badges: [] },
  { id: "u4_in", name: "Ravi", age: 35, gender: "Male", photoUrl: PLACEHOLDER_IMAGE_URL(400,400), bio: "Experienced trekker, loves challenging routes in the Indian Himalayas. Looking for partners for Kashmir Great Lakes.", travelPreferences: { soloOrGroup: "Flexible", budget: "Luxury" }, languagesSpoken: ["English", "Hindi"], trekkingExperience: "Expert", plannedTrips: [{id: "pt_in6", destinationId:"in6", destinationName: "Kashmir Great Lakes", startDate: "2025-07-01", endDate: "2025-07-10"}], badges: [mockBadgeHimalayan] },
];


export default function ConnectSpherePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState(mockUsers.map(u => ({...u, photoUrl: `${u.photoUrl}?ai_hint=person ${u.name}`})));
  const [lastSwipedProfile, setLastSwipedProfile] = useState<UserProfile | null>(null);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right' && profiles[currentIndex]) {
      console.log(`Matched with ${profiles[currentIndex].name}`);
      setLastSwipedProfile(profiles[currentIndex]); 
      setShowMatchAnimation(true);
      setTimeout(() => setShowMatchAnimation(false), 2000); 
    } else if (profiles[currentIndex]) {
      setLastSwipedProfile(profiles[currentIndex]);
    }
    
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      console.log("No more profiles");
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0 && lastSwipedProfile) { 
      setCurrentIndex(currentIndex - 1);
      setLastSwipedProfile(null); 
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
          <Image src={PLACEHOLDER_IMAGE_URL(100,100)} alt="Your profile" width={100} height={100} className="rounded-full border-4 border-primary" data-ai-hint="person user"/>
          <Image src={lastSwipedProfile.photoUrl} alt={lastSwipedProfile.name} width={100} height={100} className="rounded-full border-4 border-pink-500" data-ai-hint={`person ${lastSwipedProfile.name.split(' ')[0]}`}/>
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
          <CardDescription>Swipe right to connect, left to pass. Find your next Indian trek buddy!</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Filter Preferences
            </Button>
        </CardContent>
      </Card>

      <div className="relative w-full max-w-sm h-[calc(100vh-20rem)] min-h-[480px] flex items-center justify-center">
        {currentProfile ? (
            <UserProfileCard user={currentProfile} />
        ) : (
          <div className="text-center p-8 bg-card rounded-xl shadow-lg">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-headline text-xl">No More Profiles</h3>
            <p className="text-muted-foreground">You've seen everyone for now. Check back later or adjust your filters!</p>
             <Button onClick={() => {setProfiles(mockUsers.map(u => ({...u, photoUrl: `${u.photoUrl}?ai_hint=person ${u.name}`}))); setCurrentIndex(0);}} className="mt-4">Reload Profiles</Button>
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
