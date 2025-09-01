export interface AdminUser {
  userId: string;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  profilePicture?: string;
  joinedDate: string;
  lastActive: string;
  isActive: boolean;
  tripsCount: number;
  placesVisited: number;
  country: string;
  phoneNumber: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTrips: number;
  totalBookings: number;
}
