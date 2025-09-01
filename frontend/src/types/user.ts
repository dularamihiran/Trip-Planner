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
