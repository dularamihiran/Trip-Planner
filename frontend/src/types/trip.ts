// TypeScript interfaces for Trip Planning App

export interface Place {
  placeId: string;
  name: string;
  district: string;
  category: string;
  lat: number;
  lng: number;
}

export interface Booking {
  bookingId: string;
  hotelName: string;
  district: string;
  checkIn: string;
  checkOut: string;
  status: "CONFIRMED" | "CANCELLED";
  price: number;
}

export interface Trip {
  tripId: string;
  tripName: string;
  startDate: string;
  endDate: string;
  districts: string[];
  places: Place[];
  bookings: Booking[];
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
}

export type TripStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED";
export type SortOrder = "asc" | "desc";

export interface FilterOptions {
  search: string;
  status: TripStatus | "ALL";
  sortBy: SortOrder;
}
