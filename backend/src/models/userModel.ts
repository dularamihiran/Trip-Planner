/**
 * User Model
 * Represents a user in the system (Tourist, Hotel Owner, or Admin)
 */
export interface User {
  userId: string; // Partition Key (PK) - UUID
  email: string; // Global Secondary Index (GSI) for login
  name: string;
  password: string; // Hashed password
  role: 'USER' | 'HOTEL_OWNER' | 'ADMIN';
  phone?: string;
  avatarUrl?: string; // S3 URL for profile picture
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

/**
 * Data Transfer Object for creating a new user
 * Excludes auto-generated fields
 */
export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
  role?: 'USER' | 'HOTEL_OWNER' | 'ADMIN';
  phone?: string;
}

/**
 * Data Transfer Object for updating a user
 * All fields are optional except userId
 */
export interface UpdateUserDTO {
  userId: string;
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

/**
 * Safe user object (without password)
 * Used for API responses
 */
export type SafeUser = Omit<User, 'password'>;
