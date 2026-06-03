// TypeScript interfaces for Trip Planning App

export interface Place {
  placeId: string;
  name: string;
  district: string;
  category: string;
  lat?: number;
  lng?: number;
  visitStatus?: 'PLANNED' | 'DONE';
}

export interface Trip {
  tripId: string;
  tripName: string;
  startDate: string;
  endDate: string;
  districts: string[];
  places?: Place[];
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
}

export type TripStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED";
export type SortOrder = "asc" | "desc";

export interface FilterOptions {
  search: string;
  status: TripStatus | "ALL";
  sortBy: SortOrder;
}
