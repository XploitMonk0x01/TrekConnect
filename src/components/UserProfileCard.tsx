import { useState } from 'react'
import Image from 'next/image'
import CachedImage from './CachedImage'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { UserProfile } from '@/lib/types'
import {
  Heart,
  Languages,
  MapPin,
  Mountain,
  User,
  TrendingUp,
  Briefcase,
} from 'lucide-react'

interface UserProfileCardProps {
  user: UserProfile
  onSwipe?: (direction: 'left' | 'right') => void
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const [imageError, setImageError] = useState(false)
  const fallbackImageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    user.name || 'trekker'
  )}`

  let photoUrl = user.photoUrl || fallbackImageUrl
  let photoAiHint = 'person portrait'

  try {
    if (photoUrl.includes('?ai_hint=')) {
      const parts = photoUrl.split('?ai_hint=')
      photoUrl = parts[0]
      if (parts[1]) {
        photoAiHint = decodeURIComponent(parts[1])
      }
    } else if (user.name) {
      photoAiHint = `person ${user.name.split(' ')[0]}`
    }

    // Handle base64 images
    if (photoUrl.startsWith('data:image')) {
      try {
        // Test if the base64 string is valid
        const base64Content = photoUrl.split(',')[1]
        atob(base64Content)

        // If the base64 string is too long, use fallback
        if (photoUrl.length > 524288) {
          // 512KB limit
          photoUrl = fallbackImageUrl
        }
      } catch {
        // If base64 is invalid, use fallback
        photoUrl = fallbackImageUrl
      }
    }
  } catch (error) {
    photoUrl = fallbackImageUrl
  }

  const displayNameAge = `${user.name || 'Trekker'}${
    user.age ? `, ${user.age}` : ''
  }`
  const bioText = user.bio || 'No bio available.'
  const genderText = user.gender || 'Not specified'
  const plannedTripText =
    user.plannedTrips?.[0]?.destinationName || 'Not specified'

  const prefParts: string[] = []
  if (user.travelPreferences?.soloOrGroup)
    prefParts.push(user.travelPreferences.soloOrGroup)
  if (user.travelPreferences?.budget)
    prefParts.push(user.travelPreferences.budget)
  if (user.travelPreferences?.style)
    prefParts.push(user.travelPreferences.style)
  const travelStyleText =
    prefParts.length > 0 ? prefParts.join(', ') : 'Not specified'

  const trekkingExperienceText = user.trekkingExperience || 'Not specified'

  // Safely handle languagesSpoken - it might be a string, array, or undefined
  const languagesSpokenText = (() => {
    const langs: unknown = user.languagesSpoken as unknown
    if (!langs) return 'Languages: Not specified'

    // If it's already an array
    if (Array.isArray(langs) && (langs as string[]).length > 0) {
      return `Speaks: ${(langs as string[]).join(', ')}`
    }

    // If it's a string, convert to array
    if (typeof langs === 'string' && langs && (langs as string).trim()) {
      const languagesArray = (langs as string)
        .split(',')
        .map((lang: string) => lang.trim())
        .filter(Boolean)
      return languagesArray.length > 0
        ? `Speaks: ${languagesArray.join(', ')}`
        : 'Languages: Not specified'
    }

    return 'Languages: Not specified'
  })()

  return (
    <Card className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105 bg-card border-2">
      <div className="relative w-full h-80">
        <Image
          src={photoUrl}
          alt={user.name || 'User profile'}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="rounded-t-2xl object-cover"
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
          data-ai-hint={photoAiHint}
          onError={(e) => {
            if (!imageError) {
              setImageError(true)
              ;(e.target as HTMLImageElement).src = fallbackImageUrl
            }
          }}
        />
        {/* Experience Badge */}
        {user.trekkingExperience && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary/90 text-primary-foreground border-0 shadow-lg">
              <Mountain className="h-3 w-3 mr-1" />
              {user.trekkingExperience}
            </Badge>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <CardTitle className="font-headline text-2xl text-white font-bold drop-shadow-lg">
            {displayNameAge}
          </CardTitle>
          <CardDescription className="text-sm text-white/90 line-clamp-2 mt-1">
            {bioText}
          </CardDescription>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-3 text-primary shrink-0" />
            <span className="text-muted-foreground">{genderText}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-3 text-primary shrink-0" />
            <span className="text-muted-foreground truncate">
              Trip: {plannedTripText}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Briefcase className="h-4 w-4 mr-3 text-primary shrink-0" />
            <span className="text-muted-foreground truncate">
              {travelStyleText}
            </span>
          </div>
          {(() => {
            const langs: unknown = user.languagesSpoken as unknown
            return (
              !!langs &&
              ((Array.isArray(langs) && (langs as string[]).length > 0) ||
                (typeof langs === 'string' &&
                  !!langs &&
                  (langs as string).trim()))
            )
          })() && (
            <div className="flex items-center text-sm">
              <Languages className="h-4 w-4 mr-3 text-primary shrink-0" />
              <span className="text-muted-foreground truncate">
                {languagesSpokenText}
              </span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {user.travelPreferences?.soloOrGroup && (
            <Badge variant="secondary" className="text-xs">
              {user.travelPreferences.soloOrGroup}
            </Badge>
          )}
          {user.travelPreferences?.budget && (
            <Badge variant="secondary" className="text-xs">
              {user.travelPreferences.budget}
            </Badge>
          )}
          {user.badges &&
            user.badges.length > 0 &&
            user.badges.slice(0, 2).map((badge) => (
              <Badge
                key={badge.id || badge.name}
                variant="outline"
                className="text-xs"
              >
                {badge.name}
              </Badge>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
