export interface User {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
  bio: string;
  profilePicture?: string;
  joinedDate: string;
  lastActive: string;
}

export interface UserProfile {
  user: User;
  stats: {
    totalTrips: number;
    completedTrips: number;
    placesVisited: number;
    favoriteDestination: string;
  };
}

// New interfaces for enhanced user system
export interface Traveler {
  id: string;
  name: string;
  email: string;
  password: string;
  userType: 'traveler';
  joinedDate: string;
}

export interface HotelOwner {
  id: string;
  ownerName: string;
  email: string;
  password: string;
  userType: 'hotel_owner';
  hotelName?: string;
  location?: string;
  contactNumber?: string;
  joinedDate: string;
  hotels: Hotel[];
}

export interface Hotel {
  id: string;
  name: string;
  district: string;
  address: string;
  price: number;
  rooms: number;
  description: string;
  images: string[];
  ownerId: string;
  createdDate: string;
}

export type AccountType = 'traveler' | 'hotel_owner';

export interface LoginFormData {
  email: string;
  password: string;
  accountType: AccountType;
}

export interface RegisterFormData {
  accountType: AccountType;
  email: string;
  password: string;
  confirmPassword: string;
  // Traveler fields
  fullName?: string;
  // Hotel owner fields
  hotelName?: string;
  ownerName?: string;
  location?: string;
  contactNumber?: string;
}
