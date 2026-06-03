// API client for backend communication
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// User API
export const userApi = {
  async register(email: string, password: string, name: string, role: string = 'USER') {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getProfile(userId: string) {
    const response = await fetch(`${API_URL}/users/${userId}`);
    return response.json();
  },

  async updateProfile(userId: string, data: any) {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Trip API
export const tripApi = {
  async getUserTrips(userId: string) {
    const response = await fetch(`${API_URL}/trips/user/${userId}`);
    return response.json();
  },

  async getById(tripId: string) {
    const response = await fetch(`${API_URL}/trips/${tripId}`);
    return response.json();
  },

  async create(tripData: {
    userId: string;
    tripName: string;
    startDate: string;
    endDate: string;
    description?: string;
    budget?: number;
    districts?: string[];
  }) {
    const response = await fetch(`${API_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripData),
    });
    return response.json();
  },

  async update(tripId: string, tripData: any) {
    const response = await fetch(`${API_URL}/trips/${tripId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripData),
    });
    return response.json();
  },

  async delete(tripId: string) {
    const response = await fetch(`${API_URL}/trips/${tripId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async getPlaces(tripId: string) {
    const response = await fetch(`${API_URL}/trips/${tripId}/places`);
    const data = await response.json();
    return data.places || [];
  },

  async addPlace(tripId: string, placeData: {
    name: string;
    category: string;
    district: string;
    description?: string;
    city?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    visitDate?: string;
    visitTime?: string;
    duration?: number;
    notes?: string;
  }) {
    const response = await fetch(`${API_URL}/trips/${tripId}/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(placeData),
    });
    return response.json();
  },

  async removePlace(tripId: string, placeId: string) {
    const response = await fetch(`${API_URL}/trips/${tripId}/places/${placeId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async suggestPlaces(preferences: {
    districts: string[];
    interests: string[];
    budget?: string;
    travelers?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await fetch(`${API_URL}/trips/suggest-places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    });
    return response.json();
  },
};

// Health check
export const healthApi = {
  async check() {
    const response = await fetch(`${API_URL.replace('/api', '')}/health`);
    return response.json();
  },
};

export default {
  userApi,
  tripApi,
  healthApi,
};
