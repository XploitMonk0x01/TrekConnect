import Image from 'next/image'
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
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'

interface UserProfileCardProps {
  user: UserProfile
  onSwipe?: (direction: 'left' | 'right') => void
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  let photoUrl = user.photoUrl || PLACEHOLDER_IMAGE_URL(400, 400)
  let photoAiHint = 'person portrait'
  if (user.photoUrl && user.photoUrl.includes('?ai_hint=')) {
    const parts = user.photoUrl.split('?ai_hint=')
    photoUrl = parts[0]
    if (parts[1]) {
      photoAiHint = decodeURIComponent(parts[1])
    }
  } else if (user.name) {
    photoAiHint = `person ${user.name.split(' ')[0]}`
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
  const languagesSpokenText =
    user.languagesSpoken && user.languagesSpoken.length > 0
      ? `Speaks: ${user.languagesSpoken.join(', ')}`
      : 'Languages: Not specified'

  return (
    <Card className="w-full max-w-sm rounded-xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 bg-card">
      <div className="relative h-72">
        <Image
          src={photoUrl}
          alt={user.name || 'User profile'}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="rounded-t-xl object-cover"
          data-ai-hint={photoAiHint}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(
              400,
              400
            )
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <CardTitle className="font-headline text-2xl text-primary-foreground">
            {displayNameAge}
          </CardTitle>
          <CardDescription className="text-sm text-primary-foreground/80 line-clamp-2">
            {bioText}
          </CardDescription>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="h-4 w-4 mr-2 text-primary" />
          <span>{genderText}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span>Planning trip to: {plannedTripText}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4 mr-2 text-primary" />
          <span>Travel Style: {travelStyleText}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Mountain className="h-4 w-4 mr-2 text-primary" />
          <span>Trekking: {trekkingExperienceText}</span>
        </div>
        {user.languagesSpoken && user.languagesSpoken.length > 0 && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Languages className="h-4 w-4 mr-2 text-primary" />
            <span>{languagesSpokenText}</span>
          </div>
        )}
        {user.badges && user.badges.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {user.badges.slice(0, 3).map(
              (
                badge // Ensure badge has a unique key if 'id' is available
              ) => (
                <Badge
                  key={badge.id || badge.name}
                  variant="secondary"
                  className="text-xs"
                >
                  {badge.name}
                </Badge>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
