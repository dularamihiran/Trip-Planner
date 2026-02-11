export interface Hotel {
  hotelId: string;
  ownerId: string;
  name: string;
  district: string;
  city?: string;
  address?: string;
  price: number; // Price per night in LKR
  rooms: number;
  availableRooms?: number;
  images: string[];
  description?: string;
  amenities?: string[];
  rating?: number;
  totalReviews?: number;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateHotelInput {
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

export interface UpdateHotelInput {
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
