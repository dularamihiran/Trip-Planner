/**
 * Booking Model
 * Represents a hotel booking made by a user
 */
export interface Booking {
  bookingId: string; // Partition Key (PK) - UUID
  userId: string; // User who made the booking (GSI)
  tripId?: string; // Optional reference to a trip
  hotelId: string; // Reference to hotel (GSI)
  hotelName: string;
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  numberOfRooms: number;
  numberOfGuests: number;
  totalPrice: number; // Total booking price in LKR
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  specialRequests?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

/**
 * Data Transfer Object for creating a new booking
 */
export interface CreateBookingDTO {
  userId: string;
  tripId?: string;
  hotelId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms: number;
  numberOfGuests: number;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
}

/**
 * Data Transfer Object for updating a booking
 */
export interface UpdateBookingDTO {
  bookingId: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED';
  checkInDate?: string;
  checkOutDate?: string;
  numberOfRooms?: number;
  numberOfGuests?: number;
  specialRequests?: string;
}
