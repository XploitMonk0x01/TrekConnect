export interface UserProfile {
  id: string // MongoDB _id
  firebaseUid: string // Firebase UID for authentication
  name: string | null // From Firebase displayName
  email: string | null // From Firebase email
  photoUrl: string | null // From Firebase photoURL
  age?: number
  gender?: string
  bio?: string
  travelPreferences: {
    soloOrGroup?: 'Solo' | 'Group' | 'Flexible'
    budget?: 'Budget' | 'Mid-range' | 'Luxury' | 'Flexible'
    style?: string // e.g., Adventure, Relaxing, Cultural
  }
  languagesSpoken?: string[]
  trekkingExperience?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  wishlistDestinations?: string[] // Array of destination IDs
  travelHistory?: string[] // Array of destination IDs
  plannedTrips?: PlannedTrip[]
  badges?: Badge[]
  createdAt?: Date
  updatedAt?: Date
  lastLoginAt?: Date
}

export interface Destination {
  id: string
  name: string
  description: string
  imageUrl: string // Can be placeholder or actual URL
  country?: string
  region?: string
  attractions?: string[]
  travelTips?: string
  coordinates?: { lat: number; lng: number }
  averageRating?: number
  aiHint?: string // Hint for Pexels or other AI services
}

export interface PlannedTrip {
  id: string
  destinationId: string
  destinationName: string
  startDate: string // ISO date string
  endDate: string // ISO date string
  notes?: string
}

export interface Badge {
  id: string
  name: string
  iconUrl?: string
  description: string
}

export interface Photo {
  id: string // MongoDB _id
  userId: string // MongoDB user ID
  firebaseUid: string // Firebase UID for auth checks
  userName: string
  userAvatarUrl?: string | null
  imageUrl: string // URL from storage (or Data URI for now)
  destinationId?: string
  destinationName?: string
  caption?: string
  tags?: string[]
  uploadedAt: string // ISO date string
  likesCount: number
  commentsCount: number
  likes?: string[] // Array of user IDs who liked the photo
}

// For creating a photo, some fields are set by the backend or default
export type CreatePhotoInput = Pick<
  Photo,
  'imageUrl' | 'caption' | 'destinationId' | 'destinationName' | 'tags'
>

export interface Story {
  id: string // MongoDB _id
  userId: string // MongoDB user ID
  firebaseUid: string // Firebase UID for auth checks
  userName: string
  userAvatarUrl?: string | null
  title: string
  content: string
  imageUrl?: string | null // Optional cover image for story (URL from storage or Data URI)
  destinationId?: string
  destinationName?: string
  tags?: string[]
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  likesCount: number
  commentsCount: number
  likes?: string[] // Array of user IDs who liked the story
}

// For creating a story
export type CreateStoryInput = Pick<
  Story,
  | 'title'
  | 'content'
  | 'imageUrl'
  | 'destinationId'
  | 'destinationName'
  | 'tags'
>

export interface WeatherInfo {
  temperature: string
  condition: string
  iconCode?: string
  forecast?: WeatherForecastDay[]
}

export interface WeatherForecastDay {
  date: string
  minTemp: string
  maxTemp: string
  condition: string
  iconCode?: string
}

export type SmartMatchUserProfileInput = {
  name: string
  age: number
  gender: string
  travelPreferences: {
    soloOrGroup: string
    budget: string
  }
  languagesSpoken: string[]
  trekkingExperience: string
  wishlistDestinations: string[]
  travelHistory: string[]
}
