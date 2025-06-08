'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getSmartMatchRecommendations, SmartMatchRecommendationsInput, SmartMatchRecommendationsOutput } from "@/ai/flows/smart-match-recommendations";
import { suggestTravelDestinations, SuggestTravelDestinationsInput, SuggestTravelDestinationsOutput } from "@/ai/flows/suggest-travel-destinations";
import { Loader2, User, MapPin, Wand2, ThumbsUp, ThumbsDown } from "lucide-react";
import Image from 'next/image';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { UserProfileCard } from '@/components/UserProfileCard';
import type { UserProfile as AppUserProfile } from '@/lib/types'; // Renaming to avoid conflict with AI input type

const smartMatchSchema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.coerce.number().min(18, "Must be at least 18").max(99),
  gender: z.string().min(1, "Gender is required"),
  soloOrGroup: z.string().min(1, "Travel style is required"),
  budget: z.string().min(1, "Budget is required"),
  languagesSpoken: z.string().min(2, "Languages are required (comma separated)"),
  trekkingExperience: z.string().min(1, "Trekking experience is required"),
  wishlistDestinations: z.string().optional(),
  travelHistory: z.string().optional(),
  currentDestination: z.string().optional(),
});

const suggestDestinationsSchema = z.object({
  preferences: z.string().min(10, "Please describe your preferences in more detail."),
  travelHistory: z.string().min(10, "Please describe your travel history in more detail."),
});

export default function RecommendationsPage() {
  const [matchResults, setMatchResults] = useState<SmartMatchRecommendationsOutput | null>(null);
  const [destinationResults, setDestinationResults] = useState<SuggestTravelDestinationsOutput | null>(null);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [isDestinationLoading, setIsDestinationLoading] = useState(false);

  const matchForm = useForm<z.infer<typeof smartMatchSchema>>({
    resolver: zodResolver(smartMatchSchema),
    defaultValues: {
      name: "Alex Doe",
      age: 30,
      gender: "Non-binary",
      soloOrGroup: "Flexible",
      budget: "Mid-range",
      languagesSpoken: "English, Spanish",
      trekkingExperience: "Intermediate",
      wishlistDestinations: "Patagonia, Swiss Alps",
      travelHistory: "Machu Picchu, Dolomites",
      currentDestination: "Chamonix",
    },
  });

  const destinationForm = useForm<z.infer<typeof suggestDestinationsSchema>>({
    resolver: zodResolver(suggestDestinationsSchema),
    defaultValues: {
      preferences: "I love hiking in mountains, scenic views, budget-friendly travel, and meeting new people. Prefer off-beat locations.",
      travelHistory: "Visited Peru (Machu Picchu), Italy (Dolomites). Enjoyed multi-day treks and cultural immersion.",
    },
  });

  async function onMatchSubmit(values: z.infer<typeof smartMatchSchema>) {
    setIsMatchLoading(true);
    setMatchResults(null);
    try {
      const input: SmartMatchRecommendationsInput = {
        userProfile: {
          name: values.name,
          age: values.age,
          gender: values.gender,
          travelPreferences: {
            soloOrGroup: values.soloOrGroup,
            budget: values.budget,
          },
          languagesSpoken: values.languagesSpoken.split(',').map(lang => lang.trim()),
          trekkingExperience: values.trekkingExperience,
          wishlistDestinations: values.wishlistDestinations?.split(',').map(dest => dest.trim()) || [],
          travelHistory: values.travelHistory?.split(',').map(place => place.trim()) || [],
        },
        currentDestination: values.currentDestination,
      };
      const result = await getSmartMatchRecommendations(input);
      setMatchResults(result);
    } catch (error) {
      console.error("Error getting smart match recommendations:", error);
      // Add toast notification here
    } finally {
      setIsMatchLoading(false);
    }
  }

  async function onDestinationSubmit(values: z.infer<typeof suggestDestinationsSchema>) {
    setIsDestinationLoading(true);
    setDestinationResults(null);
    try {
      const input: SuggestTravelDestinationsInput = {
        preferences: values.preferences,
        travelHistory: values.travelHistory,
      };
      const result = await suggestTravelDestinations(input);
      setDestinationResults(result);
    } catch (error) {
      console.error("Error suggesting travel destinations:", error);
      // Add toast notification here
    } finally {
      setIsDestinationLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Wand2 className="mr-3 h-8 w-8" /> Smart Recommendations
          </CardTitle>
          <CardDescription>Let our AI help you find compatible travel partners and exciting new destinations.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Find Travel Companions</CardTitle>
          <CardDescription>Enter your details to get matched with like-minded travelers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...matchForm}>
            <form onSubmit={matchForm.handleSubmit(onMatchSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={matchForm.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={matchForm.control} name="age" render={({ field }) => ( <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={matchForm.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Non-binary">Non-binary</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={matchForm.control} name="soloOrGroup" render={({ field }) => ( <FormItem><FormLabel>Travel Style (Solo/Group)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select travel style" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Solo">Solo</SelectItem><SelectItem value="Group">Group</SelectItem><SelectItem value="Flexible">Flexible</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={matchForm.control} name="budget" render={({ field }) => ( <FormItem><FormLabel>Budget</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Budget">Budget</SelectItem><SelectItem value="Mid-range">Mid-range</SelectItem><SelectItem value="Luxury">Luxury</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={matchForm.control} name="trekkingExperience" render={({ field }) => ( <FormItem><FormLabel>Trekking Experience</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem><SelectItem value="Expert">Expert</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
              </div>
              <FormField control={matchForm.control} name="languagesSpoken" render={({ field }) => ( <FormItem><FormLabel>Languages Spoken (comma separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={matchForm.control} name="wishlistDestinations" render={({ field }) => ( <FormItem><FormLabel>Wishlist Destinations (comma separated, optional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={matchForm.control} name="travelHistory" render={({ field }) => ( <FormItem><FormLabel>Travel History (comma separated, optional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={matchForm.control} name="currentDestination" render={({ field }) => ( <FormItem><FormLabel>Current or Next Planned Destination (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
              <Button type="submit" disabled={isMatchLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                {isMatchLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Companion Matches
              </Button>
            </form>
          </Form>
        </CardContent>
        {matchResults && (
          <CardFooter className="flex-col items-start gap-4 mt-6 border-t pt-6">
            <h3 className="font-headline text-lg">Companion Recommendations:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {matchResults.recommendedMatches.map((match, index) => {
                // Adapt AI output to UserProfileCard structure
                const userProfileForCard: AppUserProfile = {
                    id: `match-${index}`,
                    name: match.name,
                    age: match.age,
                    gender: match.gender,
                    photoUrl: PLACEHOLDER_IMAGE_URL(400,400) + `?text=${match.name.charAt(0)}`, // Placeholder image
                    bio: match.reason, // Use reason as bio
                    travelPreferences: {
                        soloOrGroup: match.travelPreferences.soloOrGroup as any, // Cast needed if types differ
                        budget: match.travelPreferences.budget as any,
                    },
                    languagesSpoken: match.languagesSpoken,
                    trekkingExperience: match.trekkingExperience as any,
                };
                return <UserProfileCard key={index} user={userProfileForCard} />;
            })}
            </div>
             {matchResults.recommendedDestinations.length > 0 && (
                <>
                    <h3 className="font-headline text-lg mt-4">Suggested Destinations For You:</h3>
                    <ul className="list-disc list-inside">
                        {matchResults.recommendedDestinations.map((dest, i) => <li key={i}>{dest}</li>)}
                    </ul>
                </>
            )}
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Suggest New Destinations</CardTitle>
          <CardDescription>Tell us about your preferences and past trips to discover new places to explore.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...destinationForm}>
            <form onSubmit={destinationForm.handleSubmit(onDestinationSubmit)} className="space-y-6">
              <FormField control={destinationForm.control} name="preferences" render={({ field }) => ( <FormItem><FormLabel>Your Travel Preferences</FormLabel><FormControl><Textarea placeholder="e.g., I enjoy solo backpacking, historical sites, and trying local food. My budget is usually mid-range..." {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={destinationForm.control} name="travelHistory" render={({ field }) => ( <FormItem><FormLabel>Your Travel History</FormLabel><FormControl><Textarea placeholder="e.g., I've been to Italy (Rome, Florence), Thailand (Bangkok, Chiang Mai), and hiked parts of the Appalachian Trail..." {...field} /></FormControl><FormMessage /></FormItem> )} />
              <Button type="submit" disabled={isDestinationLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
                {isDestinationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Suggest Destinations
              </Button>
            </form>
          </Form>
        </CardContent>
        {destinationResults && (
          <CardFooter className="flex-col items-start gap-2 mt-6 border-t pt-6">
            <h3 className="font-headline text-lg">Destination Suggestions:</h3>
            <p>{destinationResults.suggestedDestinations}</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
