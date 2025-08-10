
'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Loader2,
  Save,
  ImageUp,
  AlertTriangle,
  UserCircle,
  Briefcase,
  Mountain,
} from 'lucide-react'
import NextImage from 'next/image'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { updateUserProfileClient } from '@/services/users'
import type { UserProfile } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name cannot exceed 50 characters.'),
  age: z.coerce
    .number()
    .positive('Age must be a positive number.')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['Male', 'Female']).optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters.').optional(),
  photoUrl: z.string().optional(), // Holds the base64 string for new uploads
  travelPreferences_soloOrGroup: z
    .enum(['Solo', 'Group', 'Flexible'])
    .optional(),
  travelPreferences_budget: z
    .enum(['Budget', 'Mid-range', 'Luxury', 'Flexible'])
    .optional(),
  travelPreferences_style: z
    .string()
    .max(100, 'Style cannot exceed 100 characters.')
    .optional(),
  languagesSpoken: z.string().max(200, 'Languages list too long.').optional(),
  trekkingExperience: z
    .enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function EditProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const {
    user: currentUser,
    isLoading: authIsLoading,
    updateUserInContext,
  } = useCustomAuth()
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPhotoUrlForPreview, setCurrentPhotoUrlForPreview] = useState<
    string | null
  >(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  ) // For new image selection

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      age: '',
      gender: undefined,
      bio: '',
      photoUrl: '',
      travelPreferences_soloOrGroup: undefined,
      travelPreferences_budget: undefined,
      travelPreferences_style: '',
      languagesSpoken: '',
      trekkingExperience: undefined,
    },
  })

  useEffect(() => {
    if (authIsLoading) {
      setIsLoadingProfile(true)
      return
    }
    if (currentUser) {
      form.reset({
        name: currentUser.name || '',
        age: currentUser.age || '',
        gender:
          (currentUser.gender as ProfileFormValues['gender']) || undefined,
        bio: currentUser.bio || '',
        photoUrl: '', // Reset this as it's for new uploads
        travelPreferences_soloOrGroup:
          (currentUser.travelPreferences
            ?.soloOrGroup as ProfileFormValues['travelPreferences_soloOrGroup']) ||
          undefined,
        travelPreferences_budget:
          (currentUser.travelPreferences
            ?.budget as ProfileFormValues['travelPreferences_budget']) ||
          undefined,
        travelPreferences_style: currentUser.travelPreferences?.style || '',
        languagesSpoken: Array.isArray(currentUser.languagesSpoken)
          ? currentUser.languagesSpoken.join(', ')
          : typeof currentUser.languagesSpoken === 'string'
          ? currentUser.languagesSpoken
          : '',
        trekkingExperience:
          (currentUser.trekkingExperience as ProfileFormValues['trekkingExperience']) ||
          undefined,
      })
      setCurrentPhotoUrlForPreview(currentUser.photoUrl) // Set current photo for preview
      setProfileImagePreview(null) // Clear any temporary new image preview
      setIsLoadingProfile(false)
    } else {
      setIsLoadingProfile(false)
    }
  }, [currentUser, authIsLoading, form])

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        toast({
          variant: 'destructive',
          title: 'Image Too Large',
          description: 'Maximum file size is 5MB.',
        })
        form.setError('photoUrl', {
          type: 'manual',
          message: 'Max file size is 5MB.',
        })
        setProfileImagePreview(null)
        form.setValue('photoUrl', '')
        return
      }
      if (
        ![
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
        ].includes(file.type)
      ) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Only JPG, PNG, GIF, WEBP allowed.',
        })
        form.setError('photoUrl', {
          type: 'manual',
          message: 'Invalid file type.',
        })
        setProfileImagePreview(null)
        form.setValue('photoUrl', '')
        return
      }
      form.clearErrors('photoUrl')
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
        form.setValue('photoUrl', reader.result as string, {
          shouldValidate: true,
        })
      }
      reader.readAsDataURL(file)
    } else {
      setProfileImagePreview(null)
      form.setValue('photoUrl', '')
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    if (!currentUser || !currentUser.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You are not logged in.',
      })
      return
    }
    setIsSaving(true)

    try {
      await updateUserProfileClient(currentUser.id, data)

      // Update the local context with the new user data
      const updatedUser: UserProfile = {
        ...currentUser,
        name: data.name,
        age: data.age || currentUser.age,
        gender: data.gender || currentUser.gender,
        bio: data.bio || currentUser.bio,
        photoUrl: data.photoUrl || currentUser.photoUrl,
        travelPreferences: {
          ...currentUser.travelPreferences,
          soloOrGroup:
            data.travelPreferences_soloOrGroup ||
            currentUser.travelPreferences?.soloOrGroup,
          budget:
            data.travelPreferences_budget ||
            currentUser.travelPreferences?.budget,
          style:
            data.travelPreferences_style ||
            currentUser.travelPreferences?.style,
        },
        languagesSpoken: data.languagesSpoken
          ? data.languagesSpoken
              .split(',')
              .map((lang) => lang.trim())
              .filter((lang) => lang.length > 0)
          : currentUser.languagesSpoken,
        trekkingExperience:
          data.trekkingExperience || currentUser.trekkingExperience,
      }

      updateUserInContext(updatedUser)

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully saved.',
      })
      setCurrentPhotoUrlForPreview(data.photoUrl || currentPhotoUrlForPreview)
      setProfileImagePreview(null)
      form.setValue('photoUrl', '')

      // Redirect to profile page after successful update
      setTimeout(() => {
        router.push('/profile')
      }, 1500) // Small delay to let user see the success message
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description:
          error instanceof Error ? error.message : 'Could not update profile.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const inputsDisabled = isSaving || authIsLoading || isLoadingProfile

  if (authIsLoading || isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />{' '}
        <span className="ml-2">Loading Editor...</span>
      </div>
    )
  }

  if (!currentUser && !authIsLoading) {
    return (
      <div className="container mx-auto max-w-7xl flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground">
          You need to be logged in to edit your profile.
        </p>
        <Button asChild className="mt-6">
          <Link href="/auth/signin?redirect=/profile/edit">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-8">
       <div className="flex items-center">
            <Button asChild variant="ghost" size="sm">
              <Link href="/profile">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
              </Link>
            </Button>
        </div>
      <Card className="shadow-xl border">
         <CardHeader>
            <CardTitle className="font-headline text-3xl text-primary text-center">Edit Your Profile</CardTitle>
            <CardDescription className="text-center">Keep your travel identity fresh and up to date.</CardDescription>
        </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Picture Section */}
              <div className="text-center">
                <div className="flex flex-col items-center space-y-4">
                  <NextImage
                    src={
                      profileImagePreview ||
                      currentPhotoUrlForPreview ||
                      PLACEHOLDER_IMAGE_URL(120, 120)
                    }
                    alt="Profile"
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-primary object-cover shadow-lg"
                    data-ai-hint="person current profile"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        PLACEHOLDER_IMAGE_URL(120, 120)
                    }}
                  />
                  <div className="space-y-2">
                    <Input
                      id="profile-image-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={handleProfileImageChange}
                      className="hidden"
                      disabled={inputsDisabled}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById('profile-image-upload')?.click()
                      }
                      disabled={inputsDisabled}
                    >
                      <ImageUp className="mr-2 h-4 w-4" />
                      {currentPhotoUrlForPreview || profileImagePreview
                        ? 'Change Photo'
                        : 'Upload Photo'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, GIF, WEBP up to 5MB
                    </p>
                  </div>
                </div>
                {form.formState.errors.photoUrl && (
                  <p className="text-sm text-destructive mt-2">
                    {form.formState.errors.photoUrl.message}
                  </p>
                )}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name*
                  </Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    required
                    disabled={inputsDisabled}
                    className="mt-1"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="age" className="text-sm font-medium">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    {...form.register('age')}
                    disabled={inputsDisabled}
                    className="mt-1"
                  />
                  {form.formState.errors.age && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.age.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Gender
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue(
                        'gender',
                        value as ProfileFormValues['gender']
                      )
                    }
                    value={form.watch('gender')}
                    disabled={inputsDisabled}
                  >
                    <SelectTrigger id="gender" className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.gender && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.gender.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  {...form.register('bio')}
                  rows={3}
                  placeholder="Tell us about your trekking adventures..."
                  disabled={inputsDisabled}
                  className="mt-1"
                />
                {form.formState.errors.bio && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>

              {/* Travel Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="travelPreferences_soloOrGroup"
                    className="text-sm font-medium"
                  >
                    Travel Style
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue(
                        'travelPreferences_soloOrGroup',
                        value as ProfileFormValues['travelPreferences_soloOrGroup']
                      )
                    }
                    value={form.watch('travelPreferences_soloOrGroup')}
                    disabled={inputsDisabled}
                  >
                    <SelectTrigger
                      id="travelPreferences_soloOrGroup"
                      className="mt-1"
                    >
                      <SelectValue placeholder="Solo or Group?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solo">Solo</SelectItem>
                      <SelectItem value="Group">Group</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="travelPreferences_budget"
                    className="text-sm font-medium"
                  >
                    Budget Level
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue(
                        'travelPreferences_budget',
                        value as ProfileFormValues['travelPreferences_budget']
                      )
                    }
                    value={form.watch('travelPreferences_budget')}
                    disabled={inputsDisabled}
                  >
                    <SelectTrigger
                      id="travelPreferences_budget"
                      className="mt-1"
                    >
                      <SelectValue placeholder="Budget level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Budget">Budget</SelectItem>
                      <SelectItem value="Mid-range">Mid-range</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Activities and Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="travelPreferences_style"
                    className="text-sm font-medium"
                  >
                    Preferred Activities
                  </Label>
                  <Input
                    id="travelPreferences_style"
                    {...form.register('travelPreferences_style')}
                    placeholder="e.g., Photography, Cultural tours"
                    disabled={inputsDisabled}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="trekkingExperience"
                    className="text-sm font-medium"
                  >
                    Trekking Experience
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue(
                        'trekkingExperience',
                        value as ProfileFormValues['trekkingExperience']
                      )
                    }
                    value={form.watch('trekkingExperience')}
                    disabled={inputsDisabled}
                  >
                    <SelectTrigger id="trekkingExperience" className="mt-1">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Languages */}
              <div>
                <Label
                  htmlFor="languagesSpoken"
                  className="text-sm font-medium"
                >
                  Languages Spoken
                </Label>
                <Input
                  id="languagesSpoken"
                  {...form.register('languagesSpoken')}
                  placeholder="e.g., English, Hindi, Local dialects"
                  disabled={inputsDisabled}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple languages with commas
                </p>
                {form.formState.errors.languagesSpoken && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.languagesSpoken.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={inputsDisabled || !form.formState.isDirty}
                  size="lg"
                  className="px-8"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  )
}
