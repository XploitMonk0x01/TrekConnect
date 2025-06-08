
export interface UserProfile {
  id: string; // Firebase UID
  name: string | null; // From Firebase displayName
  email: string | null; // From Firebase email
  photoUrl: string | null; // From Firebase photoURL
  age?: number;
  gender?: string;
  bio?: string;
  travelPreferences: {
    soloOrGroup?: 'Solo' | 'Group' | 'Flexible';
    budget?: 'Budget' | 'Mid-range' | 'Luxury' | 'Flexible';
    style?: string; // e.g., Adventure, Relaxing, Cultural
  };
  languagesSpoken?: string[];
  trekkingExperience?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  wishlistDestinations?: Destination[]; // Simplified for now, could be array of IDs or full objects
  travelHistory?: Destination[]; // Simplified for now
  plannedTrips?: PlannedTrip[];
  badges?: Badge[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  country?: string;
  region?: string;
  attractions?: string[];
  travelTips?: string;
  coordinates?: { lat: number; lng: number };
  averageRating?: number;
  aiHint?: string;
}

export interface PlannedTrip {
  id: string;
  destinationId: string;
  destinationName: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  notes?: string;
}

export interface Badge {
  id: string;
  name: string;
  iconUrl?: string;
  description: string;
}

export interface Photo {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  imageUrl: string;
  destinationId?: string;
  destinationName?: string;
  caption?: string;
  uploadedAt: string; // ISO date string
  likesCount?: number;
  commentsCount?: number;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  title: string;
  content: string;
  imageUrl?: string;
  destinationId?: string;
  destinationName?: string;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  tags?: string[];
  likesCount?: number;
  commentsCount?: number;
}

export interface WeatherInfo {
  temperature: string;
  condition: string;
  iconCode?: string;
  forecast?: WeatherForecastDay[];
}

export interface WeatherForecastDay {
  date: string;
  minTemp: string;
  maxTemp: string;
  condition: string;
  iconCode?: string;
}

export type SmartMatchUserProfileInput = {
  name: string;
  age: number;
  gender: string;
  travelPreferences: {
    soloOrGroup: string;
    budget: string;
  };
  languagesSpoken: string[];
  trekkingExperience: string;
  wishlistDestinations: string[];
  travelHistory: string[];
};
