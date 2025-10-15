// Основные типы для Kamchatour Hub

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tourist' | 'operator' | 'guide' | 'provider';
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  interests: string[];
  budget: {
    min: number;
    max: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  season: Season[];
  groupSize: number;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // в часах
  price: number;
  currency: 'RUB' | 'USD' | 'EUR';
  season: Season[];
  coordinates: GeoPoint[];
  requirements: string[];
  included: string[];
  notIncluded: string[];
  operator: Partner;
  guide?: Partner;
  images: Asset[];
  rating: number;
  reviewCount: number;
  maxGroupSize: number;
  minGroupSize: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Partner {
  id: string;
  name: string;
  category: 'operator' | 'guide' | 'transfer' | 'stay' | 'souvenir' | 'gear' | 'cars' | 'restaurant';
  description: string;
  contact: ContactInfo;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  logo?: Asset;
  images: Asset[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
  telegram?: string;
  whatsapp?: string;
  address?: string;
}

export interface Asset {
  id: string;
  url: string;
  mimeType: string;
  sha256: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  createdAt: Date;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

export interface Booking {
  id: string;
  userId: string;
  tourId: string;
  tour: Tour;
  date: Date;
  participants: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  tourId: string;
  rating: number;
  comment: string;
  images: Asset[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Weather {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  forecast: WeatherForecast[];
  lastUpdated: Date;
}

export interface WeatherForecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
  };
  condition: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface EcoPoint {
  id: string;
  name: string;
  description: string;
  coordinates: GeoPoint;
  category: 'recycling' | 'cleaning' | 'conservation' | 'education';
  points: number;
  isActive: boolean;
  createdAt: Date;
}

export interface UserEcoPoints {
  userId: string;
  totalPoints: number;
  level: number;
  achievements: EcoAchievement[];
  lastActivity: Date;
}

export interface EcoAchievement {
  id: string;
  name: string;
  description: string;
  points: number;
  unlockedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// AI Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: {
    location?: GeoPoint;
    preferences?: UserPreferences;
    currentTour?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}