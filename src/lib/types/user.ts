export type TravelPreferences = {
  soloOrGroup?: 'solo' | 'group' | 'both'
  budget?: 'budget' | 'mid-range' | 'luxury'
  style?: string
}

export interface UserProfile {
  id: string
  name: string | null
  email: string | null
  photoUrl: string | null
  bio: string | null
  age: number | undefined
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say' | undefined
  travelPreferences: TravelPreferences
  languagesSpoken: string[]
  trekkingExperience: 'beginner' | 'intermediate' | 'advanced' | undefined
  wishlistDestinations: string[]
  travelHistory: string[]
  plannedTrips: string[]
  badges: string[]
  createdAt?: Date
  updatedAt?: Date
}
