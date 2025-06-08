export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  photoUrl: string;
  bio?: string;
  travelPreferences: {
    soloOrGroup: 'Solo' | 'Group' | 'Flexible';
    budget: 'Budget' | 'Mid-range' | 'Luxury' | 'Flexible';
    style?: string; // e.g., Adventure, Relaxing, Cultural
  };
  languagesSpoken: string[];
  trekkingExperience: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  wishlistDestinations?: Destination[];
  travelHistory?: Destination[];
  plannedTrips?: PlannedTrip[];
  badges?: Badge[];
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
  iconUrl?: string; // Or LucideIcon name
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
  content: string; // Could be Markdown or HTML
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
  temperature: string; // e.g., "25°C"
  condition: string; // e.g., "Sunny"
  iconCode?: string; // For weather icons
  forecast?: WeatherForecastDay[];
}

export interface WeatherForecastDay {
  date: string; // ISO date string
  minTemp: string;
  maxTemp: string;
  condition: string;
  iconCode?: string;
}

// For Smart Match AI
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
