'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import {
  Input,
  Label,
  Button,
  Textarea,
  Select,
} from '@/components/ui/form-elements'
import { useAuth } from '@/contexts/AuthContext'
import { getUserById } from '@/services/auth/auth.service'
import { updateUserProfile } from '@/services/users'

export default function EditProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    bio: '',
    photoUrl: '',
    travelPreferences: {
      soloOrGroup: '',
      budget: '',
      style: '',
    },
    languagesSpoken: '',
    trekkingExperience: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    const loadProfile = async () => {
      try {
        const profile = await getUserById(user.id)
        if (profile) {
          setFormData({
            name: profile.name || '',
            age: profile.age?.toString() || '',
            gender: profile.gender || '',
            bio: profile.bio || '',
            photoUrl: profile.photoUrl || '',
            travelPreferences: {
              soloOrGroup: profile.travelPreferences?.soloOrGroup || '',
              budget: profile.travelPreferences?.budget || '',
              style: profile.travelPreferences?.style || '',
            },
            languagesSpoken: profile.languagesSpoken?.join(', ') || '',
            trekkingExperience: profile.trekkingExperience || '',
          })
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load profile data.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, router, toast])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    if (name.startsWith('travelPreferences.')) {
      const preference = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        travelPreferences: {
          ...prev.travelPreferences,
          [preference]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const updatedProfile = await updateUserProfile(user.id, {
        name: formData.name.trim(),
        photoUrl: formData.photoUrl,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        bio: formData.bio?.trim() || undefined,
        travelPreferences: {
          soloOrGroup: formData.travelPreferences.soloOrGroup || null,
          budget: formData.travelPreferences.budget || null,
          style: formData.travelPreferences.style || null,
        },
        languagesSpoken: formData.languagesSpoken
          ? formData.languagesSpoken.split(',').map((lang) => lang.trim())
          : [],
        trekkingExperience: formData.trekkingExperience || undefined,
      })

      if (updatedProfile) {
        toast({ title: 'Success', description: 'Profile updated successfully' })
        router.push('/profile')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            disabled={isLoading}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </Select>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Travel Preferences</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="travelPreferences.soloOrGroup">
                Travel Style
              </Label>
              <Select
                id="travelPreferences.soloOrGroup"
                name="travelPreferences.soloOrGroup"
                value={formData.travelPreferences.soloOrGroup}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Select preference</option>
                <option value="solo">Solo</option>
                <option value="group">Group</option>
                <option value="both">Both</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="travelPreferences.budget">Budget Level</Label>
              <Select
                id="travelPreferences.budget"
                name="travelPreferences.budget"
                value={formData.travelPreferences.budget}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Select budget</option>
                <option value="budget">Budget</option>
                <option value="moderate">Moderate</option>
                <option value="luxury">Luxury</option>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="languagesSpoken">
            Languages Spoken (comma-separated)
          </Label>
          <Input
            id="languagesSpoken"
            name="languagesSpoken"
            value={formData.languagesSpoken}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="English, Spanish, French"
          />
        </div>

        <div>
          <Label htmlFor="trekkingExperience">Trekking Experience</Label>
          <Select
            id="trekkingExperience"
            name="trekkingExperience"
            value={formData.trekkingExperience}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">Select experience level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </Select>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}
