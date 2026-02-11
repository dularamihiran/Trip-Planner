/**
 * Hotel Model
 * Represents a hotel listing in Sri Lanka
 */
export interface Hotel {
  hotelId: string; // Partition Key (PK) - UUID
  ownerId: string; // User ID of the hotel owner (GSI)
  name: string;
  district: string; // Sri Lankan district (e.g., Colombo, Kandy, Galle)
  city?: string;
  address?: string;
  price: number; // Price per night in LKR
  rooms: number; // Total number of rooms
  availableRooms?: number; // Currently available rooms
  images: string[]; // Array of S3 URLs for hotel photos
  description?: string;
  amenities?: string[]; // e.g., ['WiFi', 'Pool', 'Parking']
  rating?: number; // Average rating (0-5)
  totalReviews?: number;
  latitude?: number; // GPS coordinates
  longitude?: number;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string;
  isActive: boolean; // Whether the listing is active
}

/**
 * Data Transfer Object for creating a new hotel
 */
export interface CreateHotelDTO {
  ownerId: string;
  name: string;
  district: string;
  city?: string;
  address?: string;
  price: number;
  rooms: number;
  description?: string;
  amenities?: string[];
  contactPhone?: string;
  contactEmail?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Data Transfer Object for updating a hotel
 */
export interface UpdateHotelDTO {
  hotelId: string;
  name?: string;
  district?: string;
  city?: string;
  address?: string;
  price?: number;
  rooms?: number;
  availableRooms?: number;
  description?: string;
  amenities?: string[];
  contactPhone?: string;
  contactEmail?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
}

/**
 * Hotel search filters
 */
export interface HotelSearchFilters {
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
}
