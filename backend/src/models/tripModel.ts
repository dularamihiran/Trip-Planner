import { Booking } from './bookingModel';

/**
 * Trip Model
 * Represents a planned trip itinerary
 */
export interface Trip {
  tripId: string; // Partition Key (PK) - UUID
  userId: string; // User who created the trip (GSI)
  tripName: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  districts: string[]; // Sri Lankan districts to visit
  places: string[]; // Array of place IDs
  bookings?: Booking[]; // Associated hotel bookings (populated when fetching full trip details)
  budget?: number; // Total budget in LKR
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  description?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

/**
 * Place/Destination within a trip
 * Can be stored in Places table or embedded in Trip
 */
export interface Place {
  placeId: string; // Partition Key (PK) - UUID
  tripId: string; // Reference to parent trip (GSI)
  name: string;
  category: string; // e.g., 'Temple', 'Beach', 'Restaurant', 'Hotel'
  district: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  visitDate?: string; // Planned visit date (ISO string)
  visitTime?: string; // Planned visit time
  duration?: number; // Planned duration in hours
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data Transfer Object for creating a new trip
 */
export interface CreateTripDTO {
  userId: string;
  tripName: string;
  startDate: string;
  endDate: string;
  districts?: string[];
  budget?: number;
  description?: string;
}

/**
 * Data Transfer Object for updating a trip
 */
export interface UpdateTripDTO {
  tripId: string;
  tripName?: string;
  startDate?: string;
  endDate?: string;
  districts?: string[];
  budget?: number;
  status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  description?: string;
}

/**
 * Data Transfer Object for adding a place to a trip
 */
export interface AddPlaceDTO {
  tripId: string;
  name: string;
  category: string;
  district: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  visitDate?: string;
  visitTime?: string;
  duration?: number;
  notes?: string;
}
