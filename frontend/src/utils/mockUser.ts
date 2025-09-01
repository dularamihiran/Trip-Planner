import { User, UserProfile } from '@/types/user';

export const mockUser: User = {
  userId: 'user-001',
  fullName: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phoneNumber: '+1 (555) 123-4567',
  country: 'United States',
  bio: 'Travel enthusiast with a passion for exploring Sri Lanka\'s rich culture and natural beauty. I love discovering hidden gems and sharing travel experiences with fellow adventurers.',
  profilePicture: '', // Will be empty initially for default avatar
  joinedDate: '2024-01-15',
  lastActive: '2025-08-28'
};

export const mockUserProfile: UserProfile = {
  user: mockUser,
  stats: {
    totalTrips: 12,
    completedTrips: 8,
    placesVisited: 45,
    favoriteDestination: 'Kandy'
  }
};

// Available countries for dropdown
export const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'China', 'Colombia',
  'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece',
  'India', 'Indonesia', 'Ireland', 'Italy', 'Japan', 'Jordan',
  'Kenya', 'South Korea', 'Malaysia', 'Mexico', 'Netherlands', 'New Zealand',
  'Norway', 'Pakistan', 'Philippines', 'Poland', 'Portugal', 'Russia',
  'Saudi Arabia', 'Singapore', 'South Africa', 'Spain', 'Sri Lanka', 'Sweden',
  'Switzerland', 'Thailand', 'Turkey', 'United Arab Emirates', 'United Kingdom', 
  'United States', 'Vietnam'
].sort();

export const getDefaultAvatar = (name: string): string => {
  // Generate a simple avatar URL based on user's initials
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=059669&color=fff&size=200`;
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Basic phone number validation
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email: string): boolean => {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
