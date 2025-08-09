import { Server as NetServer, Socket } from 'net'
import { NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'

export interface SocketServer extends NetServer {
  io?: SocketIOServer
}

export interface SocketWithIO extends Socket {
  server: SocketServer
}

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: SocketWithIO
}

// UserProfile as it is stored in Firebase RTDB
export interface UserProfile {
  id: string // Firebase Auth UID
  email: string | null
  name: string | null
  photoUrl: string | null
  age?: number
  gender?: 'Male' | 'Female'
  bio?: string | null
  travelPreferences: {
    soloOrGroup?: 'Solo' | 'Group' | 'Flexible'
    budget?: 'Budget' | 'Mid-range' | 'Luxury' | 'Flexible'
    style?: string
  }
  languagesSpoken?: string[]
  trekkingExperience?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  wishlistDestinations?: string[] // Array of destination names
  travelHistory?: string[] // Array of destination names
  plannedTrips?: PlannedTrip[]
  badges?: Badge[]
  createdAt?: string | object // Can be ISO string or Firebase ServerValue
  updatedAt?: string | object
  lastLoginAt?: string | object
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
  destinationId: string
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
  id: string
  userId: string
  userName: string
  userAvatarUrl?: string | null
  imageUrl: string
  destinationId?: string // Kept for potential linking
  destinationName?: string
  caption?: string
  tags?: string[]
  uploadedAt: string // ISO string
  likesCount: number
  commentsCount: number
  likes?: string[]
}

export type CreatePhotoInput = Pick<
  Photo,
  'imageUrl' | 'caption' | 'destinationName' | 'tags'
> & { userId: string; userName: string; userAvatarUrl?: string | null }

export interface Story {
  id: string
  userId: string
  userName: string
  userAvatarUrl?: string | null
  title: string
  content: string
  imageUrl?: string | null
  destinationName?: string
  tags?: string[]
  createdAt: string // ISO string
  updatedAt: string // ISO string
  likesCount: number
  commentsCount: number
  likes?: string[]
}

export type CreateStoryInput = Pick<
  Story,
  'title' | 'content' | 'imageUrl' | 'destinationName' | 'tags'
> & { userId: string; userName: string; userAvatarUrl?: string | null }

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
  recipientId: string
  content: string
  timestamp: string | object // ISO string or Firebase ServerValue
  read: boolean
}
