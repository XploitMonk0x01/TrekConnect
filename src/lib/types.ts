export interface UserProfile {
  id: string // MongoDB _id (string representation of ObjectId for new users)
  name: string | null
  email: string | null // Email will be primary identifier for login with custom auth
  photoUrl: string | null
  age?: number
  gender?:
    | 'Male'
    | 'Female'
    | 'Non-binary'
    | 'Other'
    | 'Prefer not to say'
    | string // Allow string for flexibility
  bio?: string | null
  travelPreferences: {
    soloOrGroup?: 'Solo' | 'Group' | 'Flexible'
    budget?: 'Budget' | 'Mid-range' | 'Luxury' | 'Flexible'
    style?: string // e.g., Adventure, Relaxing, Cultural
  }
  languagesSpoken?: string[]
  trekkingExperience?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  wishlistDestinations?: string[] // Array of destination names or IDs
  travelHistory?: string[] // Array of destination names or IDs
  plannedTrips?: PlannedTrip[]
  badges?: Badge[]
  createdAt?: Date
  updatedAt?: Date
  lastLoginAt?: Date // For custom auth
}

export interface Destination {
  id: string
  name: string
  description: string
  imageUrl: string
  country?: string
  region?: string
  attractions?: string[]
  travelTips?: string
  coordinates?: { lat: number; lng: number }
  averageRating?: number
  aiHint?: string
}

export interface PlannedTrip {
  id: string
  destinationId: string // Could be destination name if IDs are not stable
  destinationName: string
  startDate: string
  endDate: string
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
  userId: string // MongoDB user _id (who uploaded)
  userName: string // Denormalized for easier display
  userAvatarUrl?: string | null // Denormalized
  imageUrl: string
  destinationId?: string
  destinationName?: string
  caption?: string
  tags?: string[]
  uploadedAt: string
  likesCount: number
  commentsCount: number
  likes?: string[] // Array of user IDs who liked
}

export type CreatePhotoInput = Pick<
  Photo,
  'imageUrl' | 'caption' | 'destinationId' | 'destinationName' | 'tags'
> & { userId: string; userName: string; userAvatarUrl?: string | null } // Add user info for creation

export interface Story {
  id: string // MongoDB _id
  userId: string // MongoDB user _id (author)
  userName: string // Denormalized
  userAvatarUrl?: string | null // Denormalized
  title: string
  content: string
  imageUrl?: string | null
  destinationId?: string
  destinationName?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  likesCount: number
  commentsCount: number
  likes?: string[] // Array of user IDs who liked
}

export type CreateStoryInput = Pick<
  Story,
  | 'title'
  | 'content'
  | 'imageUrl'
  | 'destinationId'
  | 'destinationName'
  | 'tags'
> & { userId: string; userName: string; userAvatarUrl?: string | null } // Add user info for creation

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

export interface Message {
  id: string
  roomId: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read?: boolean
}
