
'use client'

import { useState, useEffect, ChangeEvent } from 'react'
// import { useRouter } from 'next/navigation' // Keep
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast'
import {
  Button, // Shadcn Button
  Input,  // Shadcn Input
  Label,  // Shadcn Label
  Textarea, // Shadcn Textarea
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue // Shadcn Select
} from '@/components/ui/form-elements-shadcn' // Assuming you'll create this or use individual Shadcn imports
import { ArrowLeft, Loader2, Save, ImageUp, AlertTriangle } from 'lucide-react';
import NextImage from 'next/image';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
// Removed useAuth
// import { updateUserProfile } from '@/services/users'; // Custom user service for MongoDB
// import { updateProfile as updateFirebaseProfile } from 'firebase/auth'; // Firebase specific
// import { auth } from '@/lib/firebase'; // Firebase specific

// Updated Zod schema for custom auth
const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  age: z.coerce.number().positive('Age must be a positive number.').optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say', '']).optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters.').optional(),
  profileImageDataUri: z.string().optional(), // For new image upload
  travelPreferences_soloOrGroup: z.enum(['Solo', 'Group', 'Flexible', '']).optional(),
  travelPreferences_budget: z.enum(['Budget', 'Mid-range', 'Luxury', 'Flexible', '']).optional(),
  travelPreferences_style: z.string().max(100).optional(),
  languagesSpoken: z.string().optional(), // Comma-separated
  trekkingExperience: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert', '']).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
  // const router = useRouter() // Keep
  const { toast } = useToast()
  // const { user: firebaseUser, loading: authLoading } = useAuth() // Removed
  const [isLoading, setIsLoading] = useState(true) // For loading profile data
  const [isSaving, setIsSaving] = useState(false)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Placeholder for custom auth state
  const authLoading = false; // Simulate auth loaded
  const currentUser = null; // Simulate logged out, replace with actual custom user object
  // const currentUserId = currentUser?.id; // Get from custom auth token/context

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      age: '',
      gender: '',
      bio: '',
      profileImageDataUri: '',
      travelPreferences_soloOrGroup: '',
      travelPreferences_budget: '',
      travelPreferences_style: '',
      languagesSpoken: '',
      trekkingExperience: '',
    },
  });

  useEffect(() => {
    // This effect needs to be rewritten for custom auth.
    // It should fetch the user's profile from MongoDB using their custom ID.
    // For now, it simulates a loading state and then an empty form.
    // if (!currentUserId && !authLoading) {
    //   // router.push('/auth/signin?redirect=/profile/edit');
    //   setIsLoading(false);
    //   return;
    // }

    // if (currentUserId) {
    //   const loadProfile = async () => {
    //     setIsLoading(true);
    //     try {
    //       // const profile = await getUserProfileService(currentUserId); // Your new service
    //       // if (profile) {
    //       //   form.reset({ /* map profile to form values */});
    //       //   setCurrentPhotoUrl(profile.photoUrl);
    //       // } else {
    //       //   toast({ variant: 'destructive', title: 'Error', description: 'Could not load profile.' });
    //       // }
    //     } catch (error) { /* ... */ } finally { setIsLoading(false); }
    //   };
    //   // loadProfile();
    // }
    setIsLoading(false); // Simulate loading done
  }, [/* currentUserId from custom auth */, authLoading, form, toast /*, router */]);


  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        toast({ variant: "destructive", title: "Image Too Large", description: "Maximum file size is 5MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
        form.setValue('profileImageDataUri', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImagePreview(null);
      form.setValue('profileImageDataUri', '');
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    // if (!currentUserId) {
    //   toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
    //   return;
    // }
    setIsSaving(true);
    console.log('Custom profile update attempt:', data);
    toast({
      title: 'Profile Update (Custom)',
      description: 'Profile update logic with MongoDB needs to be implemented.',
    });
    // Placeholder:
    // const profileUpdateData = { /* map data from ProfileFormValues to UserProfile update structure */};
    // if (data.profileImageDataUri) profileUpdateData.photoUrl = data.profileImageDataUri;
    // else if (profileImagePreview === null && currentPhotoUrl) { /* Logic to remove photo if needed */ }

    // try {
    //   // const updatedMongoDBProfile = await updateUserProfileService(currentUserId, profileUpdateData);
    //   // if (!updatedMongoDBProfile) throw new Error('Failed to update profile in database.');
    //   // toast({ title: 'Profile Updated', description: 'Your profile has been saved.'});
    //   // setCurrentPhotoUrl(updatedMongoDBProfile.photoUrl);
    //   // setProfileImagePreview(null); // Reset preview
    //   // router.push('/profile');
    // } catch (error: any) { /* ... */ } finally { setIsSaving(false); }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading Editor...</span>
      </div>
    );
  }

  if (!currentUser && !authLoading) { // currentUser from custom auth
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground">
          You need to be logged in to edit your profile.
        </p>
        <Button asChild className="mt-6">
          <Link href="/auth/signin?redirect=/profile/edit">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href="/profile"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile</Link>
        </Button>
        <h1 className="text-2xl font-bold font-headline text-primary">Edit Profile</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-xl">
        {/* Profile Image Section */}
        <div className="space-y-2">
          <Label>Profile Picture</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={profileImagePreview || currentPhotoUrl || PLACEHOLDER_IMAGE_URL(80,80)} alt="Profile" data-ai-hint="person current profile"/>
              <AvatarFallback>{form.getValues('name')?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <Input
              id="profile-image-upload"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleProfileImageChange}
              className="hidden"
            />
            <Button type="button" variant="outline" onClick={() => document.getElementById('profile-image-upload')?.click()}>
              <ImageUp className="mr-2 h-4 w-4" /> {currentPhotoUrl || profileImagePreview ? "Change Image" : "Upload Image"}
            </Button>
          </div>
          {form.formState.errors.profileImageDataUri && <p className="text-sm text-destructive">{form.formState.errors.profileImageDataUri.message}</p>}
        </div>

        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><Label htmlFor="name">Full Name</Label><Input id="name" {...field} required disabled={isSaving} /></FormItem> )} />
        <FormField control={form.control} name="bio" render={({ field }) => ( <FormItem><Label htmlFor="bio">Bio (Optional)</Label><Textarea id="bio" {...field} rows={4} placeholder="Tell us a bit about your trekking adventures..." disabled={isSaving} /></FormItem> )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="age" render={({ field }) => ( <FormItem><Label htmlFor="age">Age (Optional)</Label><Input id="age" type="number" {...field} disabled={isSaving} /></FormItem> )} />
          <FormField control={form.control} name="gender" render={({ field }) => (
            <FormItem>
              <Label htmlFor="gender">Gender (Optional)</Label>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving}>
                <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select gender</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 mt-4 border-b pb-1">Travel Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <FormField control={form.control} name="travelPreferences_soloOrGroup" render={({ field }) => (
              <FormItem>
                <Label htmlFor="travelPreferences_soloOrGroup">Travel Style</Label>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving}>
                  <SelectTrigger id="travelPreferences_soloOrGroup"><SelectValue placeholder="Solo or Group?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select preference</SelectItem>
                    <SelectItem value="Solo">Solo</SelectItem>
                    <SelectItem value="Group">Group</SelectItem>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <FormField control={form.control} name="travelPreferences_budget" render={({ field }) => (
              <FormItem>
                <Label htmlFor="travelPreferences_budget">Budget Level</Label>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving}>
                  <SelectTrigger id="travelPreferences_budget"><SelectValue placeholder="Budget level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select budget</SelectItem>
                    <SelectItem value="Budget">Budget</SelectItem>
                    <SelectItem value="Mid-range">Mid-range</SelectItem>
                    <SelectItem value="Luxury">Luxury</SelectItem>
                     <SelectItem value="Flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
          </div>
           <FormField control={form.control} name="travelPreferences_style" render={({ field }) => ( <FormItem className="mt-4"><Label htmlFor="travelPreferences_style">Preferred Activities/Style (Optional)</Label><Input id="travelPreferences_style" {...field} placeholder="e.g., Challenging treks, Photography, Cultural immersion" disabled={isSaving} /></FormItem> )} />
        </div>
        
        <FormField control={form.control} name="languagesSpoken" render={({ field }) => ( <FormItem><Label htmlFor="languagesSpoken">Languages Spoken (Optional, comma-separated)</Label><Input id="languagesSpoken" {...field} placeholder="e.g., English, Hindi, Local dialects" disabled={isSaving} /></FormItem> )} />
        <FormField control={form.control} name="trekkingExperience" render={({ field }) => (
          <FormItem>
            <Label htmlFor="trekkingExperience">Trekking Experience (Optional)</Label>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving}>
              <SelectTrigger id="trekkingExperience"><SelectValue placeholder="Select experience level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select experience</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )} />

        <Button type="submit" disabled={isSaving || authLoading} className="w-full sm:w-auto">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </form>
    </div>
  );
}

// Helper components for Shadcn form items if not already in form-elements-shadcn
// These can be part of ui/form.tsx if you are using shadcn's Form component structure
interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}
const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-1.5", className)} {...props} />;
});
FormItem.displayName = "FormItem";

// Avatar components (if not already globally available or part of a UI kit)
const Avatar = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("inline-block relative overflow-hidden rounded-full bg-muted", className)} {...props} />
);
const AvatarImage = ({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img className={cn("aspect-square h-full w-full object-cover", className)} {...props} alt={props.alt || "avatar"} />
);
const AvatarFallback = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground", className)} {...props} />
);

// cn utility if not imported from lib/utils
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Assuming form-elements-shadcn.tsx provides Shadcn-styled components
// If not, you'd import them directly from @/components/ui/*
// e.g. import { Input } from '@/components/ui/input';
