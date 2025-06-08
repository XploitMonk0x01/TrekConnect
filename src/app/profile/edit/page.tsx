
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image'; // For Next/Image component

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
import { ArrowLeft, Save, Loader2, UserCircle, ImagePlus } from 'lucide-react';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { auth } from '@/lib/firebase'; // Import auth
import { updateProfile as updateFirebaseProfile } from 'firebase/auth'; // Firebase client-side update


const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must not exceed 50 characters."}),
  profileImageDataUri: z.string().optional(), // Will hold the Data URI if a new image is selected
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
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      profileImageDataUri: '',
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
              name: profile.name || firebaseUser.displayName || '',
              profileImageDataUri: '', 
              age: profile.age !== undefined ? profile.age : '',
              gender: profile.gender || '',
              bio: profile.bio || '',
              travelPreferences_soloOrGroup: profile.travelPreferences?.soloOrGroup || '',
              travelPreferences_budget: profile.travelPreferences?.budget || '',
              travelPreferences_style: profile.travelPreferences?.style || '',
              languagesSpoken: profile.languagesSpoken?.join(', ') || '',
              trekkingExperience: profile.trekkingExperience || '',
            });
            setCurrentPhotoUrl(profile.photoUrl); 
          } else {
             form.reset({
                name: firebaseUser.displayName || '',
                profileImageDataUri: '',
                age: '', gender: '', bio: '',
                travelPreferences_soloOrGroup: '', travelPreferences_budget: '', travelPreferences_style: '',
                languagesSpoken: '', trekkingExperience: '',
             });
             setCurrentPhotoUrl(firebaseUser.photoURL);
          }
        })
        .catch(error => {
          console.error("Failed to fetch user profile:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load profile data.' });
           form.reset({ name: firebaseUser.displayName || '', profileImageDataUri: '' });
           setCurrentPhotoUrl(firebaseUser.photoURL);
        })
        .finally(() => {
          setIsLoadingProfile(false);
        });
    } else if (!authLoading) {
      setIsLoadingProfile(false);
    }
  }, [firebaseUser, authLoading, form, toast]);

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5000000) { 
          form.setError("profileImageDataUri", { type: "manual", message: "Max file size is 5MB." });
          setImagePreview(null);
          form.setValue("profileImageDataUri", ""); 
          return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          form.setError("profileImageDataUri", { type: "manual", message: "Invalid file type." });
          setImagePreview(null);
          form.setValue("profileImageDataUri", ""); 
          return;
      }
      form.clearErrors("profileImageDataUri");

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue('profileImageDataUri', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      form.setValue('profileImageDataUri', ''); 
    }
  };


  async function onSubmit(data: ProfileFormValues) {
    if (!firebaseUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
      return;
    }
    setIsSaving(true);

    const profileUpdateData: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt' | 'updatedAt'>> = {};

    profileUpdateData.name = data.name.trim();
    
    if (data.profileImageDataUri && data.profileImageDataUri.startsWith('data:image')) {
      profileUpdateData.photoUrl = data.profileImageDataUri;
    }

    profileUpdateData.age = data.age === '' || data.age === undefined || isNaN(Number(data.age)) ? undefined : Number(data.age);
    profileUpdateData.gender = data.gender === '' ? undefined : data.gender as UserProfile['gender'];
    
    profileUpdateData.bio = data.bio && data.bio.trim() !== '' ? data.bio.trim() : null;

    const travelPrefsInput = {
      soloOrGroup: data.travelPreferences_soloOrGroup === '' ? undefined : data.travelPreferences_soloOrGroup as UserProfile['travelPreferences']['soloOrGroup'],
      budget: data.travelPreferences_budget === '' ? undefined : data.travelPreferences_budget as UserProfile['travelPreferences']['budget'],
      style: data.travelPreferences_style && data.travelPreferences_style.trim() !== '' ? data.travelPreferences_style.trim() : undefined,
    };

    if (travelPrefsInput.soloOrGroup || travelPrefsInput.budget || travelPrefsInput.style) {
      profileUpdateData.travelPreferences = travelPrefsInput;
    } else {
      profileUpdateData.travelPreferences = undefined; 
    }
    
    profileUpdateData.languagesSpoken = data.languagesSpoken && data.languagesSpoken.trim() !== ''
      ? data.languagesSpoken.split(',').map(lang => lang.trim()).filter(lang => lang)
      : undefined;
      
    profileUpdateData.trekkingExperience = data.trekkingExperience === '' ? undefined : data.trekkingExperience as UserProfile['trekkingExperience'];
    
    const cleanedProfileUpdateData: { [key: string]: any } = {};
    for (const key in profileUpdateData) {
        const typedKey = key as keyof typeof profileUpdateData;
        if (profileUpdateData[typedKey] !== undefined) {
            cleanedProfileUpdateData[typedKey] = profileUpdateData[typedKey];
        }
    }
    if (profileUpdateData.bio === null) cleanedProfileUpdateData.bio = null;
    if (profileUpdateData.photoUrl === null && !(data.profileImageDataUri && data.profileImageDataUri.startsWith('data:image'))) {
      // Only set photoUrl to null if it was intentionally cleared AND no new image was uploaded
      // This case should ideally be handled by not including photoUrl in cleanedProfileUpdateData if no new image
    }


    console.log("[TrekConnect Debug Client] Calling updateUserProfile from edit/page.tsx with UID:", firebaseUser.uid, "and data:", JSON.stringify(cleanedProfileUpdateData, null, 2));
    
    try {
      const updatedMongoDBProfile = await updateUserProfile(firebaseUser.uid, cleanedProfileUpdateData);
      
      if (updatedMongoDBProfile) {
        toast({ title: 'Profile Updated', description: 'Your profile has been successfully updated in our database.' });
        setCurrentPhotoUrl(updatedMongoDBProfile.photoUrl); 

        let fbProfileNeedsUpdate = false;
        const fbUpdatePayload: { displayName?: string | null; photoURL?: string | null } = {};

        if (data.profileImageDataUri && data.profileImageDataUri.startsWith('data:image')) {
            fbUpdatePayload.photoURL = updatedMongoDBProfile.photoUrl;
            fbProfileNeedsUpdate = true;
        }
        if (updatedMongoDBProfile.name !== firebaseUser.displayName) {
            fbUpdatePayload.displayName = updatedMongoDBProfile.name;
            fbProfileNeedsUpdate = true;
        }

        if (fbProfileNeedsUpdate && auth.currentUser) {
          try {
            await updateFirebaseProfile(auth.currentUser, fbUpdatePayload);
            toast({ title: 'Firebase Profile Sync', description: 'Your Firebase profile avatar and/or name will update shortly.' });
          } catch (fbError: any) {
            console.error("Error updating Firebase user profile:", fbError);
            toast({ variant: 'destructive', title: 'Firebase Sync Failed', description: `Could not update your avatar/name in Firebase: ${fbError.message}` });
          }
        }
        
        setImagePreview(null);
        // form.setValue('profileImageDataUri', ''); // Already cleared or set by handleProfileImageChange
        // Reset form with potentially updated values from DB, but keep form state managed by RHF
        // This reset also helps clear the profileImageDataUri if it was from a previous submission that's now done
        form.reset({ 
            ...form.getValues(), // keep current form values
            name: updatedMongoDBProfile.name || '',
            bio: updatedMongoDBProfile.bio || '',
            age: updatedMongoDBProfile.age !== undefined ? updatedMongoDBProfile.age : '',
            gender: updatedMongoDBProfile.gender || '',
            travelPreferences_soloOrGroup: updatedMongoDBProfile.travelPreferences?.soloOrGroup || '',
            travelPreferences_budget: updatedMongoDBProfile.travelPreferences?.budget || '',
            travelPreferences_style: updatedMongoDBProfile.travelPreferences?.style || '',
            languagesSpoken: updatedMongoDBProfile.languagesSpoken?.join(', ') || '',
            trekkingExperience: updatedMongoDBProfile.trekkingExperience || '',
            profileImageDataUri: '', // Explicitly clear this from form state after successful processing
        }); 
        
        router.push('/profile'); 
      } else {
        throw new Error('Failed to update profile in database.');
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message || 'Could not update your profile. Please try again.' });
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
            <div className="flex flex-col items-center gap-4 mb-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-10 w-32" />
            </div>
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
            <Link href="/auth/signin?redirect=/profile/edit">Sign In</Link>
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
              
              <FormItem className="flex flex-col items-center gap-4">
                <FormLabel>Profile Picture</FormLabel>
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary/50">
                  <Image 
                    src={imagePreview || currentPhotoUrl || PLACEHOLDER_IMAGE_URL(96,96)} 
                    alt="Profile" 
                    fill
                    className="object-cover"
                    data-ai-hint="person portrait"
                    key={imagePreview || currentPhotoUrl} 
                  />
                </div>
                <Input 
                  id="profile-image-upload"
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,image/gif" 
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
                 <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('profile-image-upload')?.click()}>
                    <ImagePlus className="mr-2 h-4 w-4"/> {imagePreview || currentPhotoUrl ? 'Change' : 'Upload'} Image
                </Button>
                <FormField
                    control={form.control}
                    name="profileImageDataUri"
                    render={({ field }) => (
                    <FormItem className="hidden"> 
                        <FormControl><Input type="text" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </FormItem>

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
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl><Input type="number" placeholder="Your age" {...field} value={field.value === undefined ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} /></FormControl>
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
                      <Select onValueChange={field.onChange} value={field.value || ''}>
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
                    <FormControl><Textarea placeholder="Tell us about your trekking passion, favorite types of treks, etc." {...field} value={field.value || ''} rows={4} /></FormControl>
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
                      <Select onValueChange={field.onChange} value={field.value || ''}>
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
                      <Select onValueChange={field.onChange} value={field.value || ''}>
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
                      <FormControl><Input placeholder="e.g., Adventure, Relaxing" {...field} value={field.value || ''} /></FormControl>
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
                    <FormControl><Input placeholder="e.g., English, Hindi, Spanish (comma-separated)" {...field} value={field.value || ''} /></FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value || ''}>
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
              <Button type="submit" disabled={isSaving || isLoadingProfile || authLoading} className="bg-primary hover:bg-primary/90">
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
    

    
