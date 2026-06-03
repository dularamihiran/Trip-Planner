export type UserRole = 'USER' | 'ADMIN';

export interface User {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  address?: string;
  bio?: string;
  profilePicture?: string;
  role: UserRole;
  createdAt: string;
  lastActive?: string;
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
