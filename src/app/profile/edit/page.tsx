
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, updateUserProfile } from '@/services/users';
import type { UserProfile } from '@/lib/types';
import { ArrowLeft, Save, Loader2, UserCircle } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must not exceed 50 characters."}),
  photoUrl: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')).optional(),
  age: z.coerce.number().min(0, { message: "Age cannot be negative."}).max(120, {message: "Age seems unlikely."}).optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say', '']).optional(),
  bio: z.string().max(500, { message: "Bio must not exceed 500 characters." }).optional(),
  travelPreferences_soloOrGroup: z.enum(['Solo', 'Group', 'Flexible', '']).optional(),
  travelPreferences_budget: z.enum(['Budget', 'Mid-range', 'Luxury', 'Flexible', '']).optional(),
  travelPreferences_style: z.string().max(100, { message: "Travel style must not exceed 100 characters." }).optional(),
  languagesSpoken: z.string().max(200, { message: "Languages spoken must not exceed 200 characters."}).optional(),
  trekkingExperience: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert', '']).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      photoUrl: '',
      age: '',
      gender: '',
      bio: '',
      travelPreferences_soloOrGroup: '',
      travelPreferences_budget: '',
      travelPreferences_style: '',
      languagesSpoken: '',
      trekkingExperience: '',
    },
  });

  useEffect(() => {
    if (firebaseUser) {
      setIsLoadingProfile(true);
      getUserProfile(firebaseUser.uid)
        .then(profile => {
          if (profile) {
            form.reset({
              name: profile.name || '',
              photoUrl: profile.photoUrl || '',
              age: profile.age !== undefined ? profile.age : '',
              gender: profile.gender || '',
              bio: profile.bio || '',
              travelPreferences_soloOrGroup: profile.travelPreferences?.soloOrGroup || '',
              travelPreferences_budget: profile.travelPreferences?.budget || '',
              travelPreferences_style: profile.travelPreferences?.style || '',
              languagesSpoken: profile.languagesSpoken?.join(', ') || '',
              trekkingExperience: profile.trekkingExperience || '',
            });
          }
        })
        .catch(error => {
          console.error("Failed to fetch user profile:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load profile data.' });
        })
        .finally(() => {
          setIsLoadingProfile(false);
        });
    } else if (!authLoading) {
      setIsLoadingProfile(false);
      // Redirect if not logged in and not loading
      router.push('/auth/signin');
       toast({ variant: 'destructive', title: 'Unauthorized', description: 'Please sign in to edit your profile.' });
    }
  }, [firebaseUser, authLoading, form, router, toast]);

  async function onSubmit(data: ProfileFormValues) {
    if (!firebaseUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
      return;
    }
    setIsSaving(true);

    const languages = data.languagesSpoken ? data.languagesSpoken.split(',').map(lang => lang.trim()).filter(lang => lang) : [];
    
    const profileUpdateData: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt' | 'updatedAt'>> = {
      name: data.name,
      photoUrl: data.photoUrl || null,
      age: data.age === '' ? undefined : Number(data.age),
      gender: data.gender || undefined,
      bio: data.bio || undefined,
      travelPreferences: {
        soloOrGroup: data.travelPreferences_soloOrGroup as UserProfile['travelPreferences']['soloOrGroup'] || undefined,
        budget: data.travelPreferences_budget as UserProfile['travelPreferences']['budget'] || undefined,
        style: data.travelPreferences_style || undefined,
      },
      languagesSpoken: languages.length > 0 ? languages : undefined,
      trekkingExperience: data.trekkingExperience as UserProfile['trekkingExperience'] || undefined,
    };

    try {
      const updatedProfile = await updateUserProfile(firebaseUser.uid, profileUpdateData);
      if (updatedProfile) {
        toast({ title: 'Profile Updated', description: 'Your profile has been successfully updated.' });
        router.push('/profile');
      } else {
        throw new Error('Failed to update profile.');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update your profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  }

  if (authLoading || isLoadingProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!firebaseUser && !authLoading) {
     return (
      <Card className="text-center shadow-lg p-8">
        <CardHeader>
          <UserCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="font-headline text-2xl">Access Denied</CardTitle>
          <CardDescription>You need to be signed in to edit your profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Edit Your Profile</CardTitle>
          <CardDescription>Keep your TrekConnect profile up-to-date.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo URL</FormLabel>
                    <FormControl><Input placeholder="https://example.com/your-photo.jpg" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl><Input type="number" placeholder="Your age" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Non-binary">Non-binary</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl><Textarea placeholder="Tell us about your trekking passion, favorite types of treks, etc." {...field} rows={4} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardTitle className="font-headline text-lg pt-4 border-t">Travel Preferences</CardTitle>
              <div className="grid md:grid-cols-3 gap-6">
                 <FormField
                  control={form.control}
                  name="travelPreferences_soloOrGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solo/Group</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select preference" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Solo">Solo</SelectItem>
                          <SelectItem value="Group">Group</SelectItem>
                          <SelectItem value="Flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="travelPreferences_budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Budget">Budget</SelectItem>
                          <SelectItem value="Mid-range">Mid-range</SelectItem>
                          <SelectItem value="Luxury">Luxury</SelectItem>
                          <SelectItem value="Flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="travelPreferences_style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Travel Style</FormLabel>
                      <FormControl><Input placeholder="e.g., Adventure, Relaxing" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
             
              <FormField
                control={form.control}
                name="languagesSpoken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Languages Spoken</FormLabel>
                    <FormControl><Input placeholder="e.g., English, Hindi, Spanish (comma-separated)" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trekkingExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trekking Experience</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select experience level" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving || isLoadingProfile} className="bg-primary hover:bg-primary/90">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
