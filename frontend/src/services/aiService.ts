// AI Service to interact with the backend AI planning endpoints
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface RecommendedPlace {
  name: string;
  reason: string;
}

export interface Itinerary {
  [day: string]: string[];
}

export interface AiRecommendationResponse {
  recommendedPlaces: RecommendedPlace[];
  itinerary: Itinerary;
}

export interface AiRecommendationsParams {
  districts: string[];
  interests: string[];
  budget: string;
  days: number;
}

/**
 * Fetch AI-powered attraction recommendations and day-by-day itineraries
 */
export const getAiRecommendations = async (
  params: AiRecommendationsParams
): Promise<AiRecommendationResponse> => {
  try {
    const response = await fetch(`${API_URL}/ai/recommend-trip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        districts: params.districts,
        interests: params.interests,
        budget: params.budget || 'Medium',
        days: params.days || 3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to fetch AI recommendations');
    }

    const data = await response.json();
    return data as AiRecommendationResponse;
  } catch (error: any) {
    console.error('❌ AI Service Frontend Error:', error);
    throw error;
  }
};

export interface SelectedPlaceInput {
  name: string;
  district: string;
  category: string;
  lat: number;
  lng: number;
  description?: string;
  estimatedCost?: number;
}

export interface OptimizeItineraryParams {
  places: SelectedPlaceInput[];
  days: number;
  budget: string;
  startPoint?: string;
}

export interface DayItineraryResponse {
  district: string;
  places: string[];
}

export interface OptimizeItineraryResponse {
  itinerary: {
    [day: string]: DayItineraryResponse;
  };
}

/**
 * Optimize user selected places geographically into day-by-day itineraries using AI
 */
export const optimizeItinerary = async (
  params: OptimizeItineraryParams
): Promise<OptimizeItineraryResponse> => {
  try {
    const response = await fetch(`${API_URL}/ai/optimize-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to optimize itinerary');
    }

    const data = await response.json();
    return data as OptimizeItineraryResponse;
  } catch (error: any) {
    console.error('❌ AI Service Frontend Optimize Itinerary Error:', error);
    throw error;
  }
};

