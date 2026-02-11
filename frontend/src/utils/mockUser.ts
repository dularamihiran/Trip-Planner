/**
 * User utility functions
 */

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
