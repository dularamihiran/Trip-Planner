import { OpenAI } from 'openai';
import { getCollection, Collections } from '../config/mongodb';

// Define Place Interface matching seed structure
export interface PlaceDocument {
  placeId: string;
  name: string;
  district: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  estimatedCost: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface RecommendationRequest {
  districts: string[];
  interests: string[];
  budget: string;
  days: number;
}

export interface RecommendedPlace {
  name: string;
  reason: string;
}

export interface Itinerary {
  [day: string]: string[];
}

export interface RecommendationResponse {
  recommendedPlaces: RecommendedPlace[];
  itinerary: Itinerary;
}

// Normalized mapping from front-end interest selections to DB categories
const INTEREST_TO_CATEGORIES_MAP: Record<string, string[]> = {
  'Historical Sites': ['Historical Sites'],
  'Beaches': ['Beaches'],
  'Wildlife': ['Wildlife'],
  'Adventure Sports': ['Adventure', 'Hiking'],
  'Cultural Experiences': ['Cultural Experiences', 'Religious Sites', 'Historical Sites'],
  'Tea Plantations': ['Scenic Views', 'Nature'],
  'Religious Sites': ['Religious Sites'],
  'Hill Country': ['Scenic Views', 'Hiking', 'Nature'],
  'Nature': ['Nature', 'Scenic Views', 'Waterfalls'],
  'Hiking': ['Hiking', 'Nature'],
  'Waterfalls': ['Waterfalls', 'Nature'],
  'Adventure': ['Adventure', 'Hiking'],
  'Scenic Views': ['Scenic Views', 'Nature'],
};

/**
 * Generate AI-Powered Attraction Recommendations & Itinerary
 */
export const getRecommendation = async (
  params: RecommendationRequest
): Promise<RecommendationResponse> => {
  const { districts, interests, budget, days } = params;

  // 1. Get places collection using native MongoDB driver
  const placesCollection = await getCollection(Collections.PLACES);
  const places = (await placesCollection.find({}).toArray()) as any as PlaceDocument[];

  console.log(`🤖 AI Planner: Fetched ${places.length} total places for filtering.`);

  // 2. Map frontend interests to database categories
  const targetCategories = new Set<string>();
  if (interests && Array.isArray(interests)) {
    interests.forEach((interest) => {
      const mapped = INTEREST_TO_CATEGORIES_MAP[interest] || [interest];
      mapped.forEach((cat) => targetCategories.add(cat));
    });
  }

  // 3. Filter attractions by district and mapped categories
  let matchedPlaces = places.filter(
    (place) =>
      districts.includes(place.district) &&
      (targetCategories.size === 0 || targetCategories.has(place.category))
  );

  console.log(`🔍 AI Planner: District & Interest matches: ${matchedPlaces.length}`);

  // Fallback 1: Filter by district only if no intersection matches
  if (matchedPlaces.length === 0 && districts.length > 0) {
    matchedPlaces = places.filter((place) => districts.includes(place.district));
    console.log(`⚠️ AI Fallback 1: Matching by district only: ${matchedPlaces.length}`);
  }

  // Fallback 2: Filter by category only if no district matches
  if (matchedPlaces.length === 0 && targetCategories.size > 0) {
    matchedPlaces = places.filter((place) => targetCategories.has(place.category));
    console.log(`⚠️ AI Fallback 2: Matching by category only: ${matchedPlaces.length}`);
  }

  // Fallback 3: Return top 20 places if all filters yield 0
  if (matchedPlaces.length === 0) {
    matchedPlaces = places.slice(0, 20);
    console.log(`⚠️ AI Fallback 3: Returning first 20 places.`);
  }

  // 4. Limit to 20 attractions maximum to control token size
  const selectedPlacesForAi = matchedPlaces.slice(0, 20);

  // 5. Initialize OpenAI Client
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable. Please configure it in your backend .env file.');
  }

  const openai = new OpenAI({ apiKey });

  // 6. Build the OpenAI Prompt
  const systemPrompt = `You are a premium AI Travel Planner specializing in Sri Lanka.
Your job is to recommend the best travel attractions and design a cohesive day-by-day itinerary based on the user's preferences and a provided list of realistic attractions in Sri Lanka.

You MUST respond with a valid JSON object matching the following structure exactly:
{
  "recommendedPlaces": [
    {
      "name": "Exact Attraction Name",
      "reason": "Clear, engaging description of why this attraction matches the user's selected interests and budget."
    }
  ],
  "itinerary": {
    "day1": [
      "Exact Attraction Name",
      "Exact Attraction Name"
    ],
    "day2": [
      "Exact Attraction Name"
    ]
  }
}

Guidelines:
1. ONLY recommend places that are present in the provided list of attractions below.
2. Group the itinerary by day, matching the number of travel days requested (days = ${days}). Generate keys: "day1", "day2", ..., up to "day${days}".
3. Arrange attraction order within and across days to minimize travel distance (logical geographic grouping by district or proximity).
4. Closely align recommended places with the user's selected interests (${JSON.stringify(interests)}).
5. Consider the user's budget category (${budget}) when selecting attractions and estimating costs.
6. Return only the JSON object. Do not include any markdown formatting like \`\`\`json or regular text.`;

  const userPrompt = `User Preferences:
- Districts to visit: ${JSON.stringify(districts)}
- Travel Interests: ${JSON.stringify(interests)}
- Budget Level: ${budget}
- Number of Days: ${days}

Available Attractions to Select From:
${JSON.stringify(
  selectedPlacesForAi.map((p) => ({
    name: p.name,
    district: p.district,
    category: p.category,
    description: p.description,
    estimatedCost: p.estimatedCost,
  })),
  null,
  2
)}

Generate the recommendations and day-by-day itinerary now. Make sure the JSON is perfectly formatted.`;

  try {
    // 7. Send Request to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) {
      throw new Error('Received empty response from OpenAI');
    }

    // 8. Parse and Return the Structured JSON
    const jsonResponse = JSON.parse(resultText) as RecommendationResponse;
    return jsonResponse;
  } catch (error: any) {
    console.error('❌ OpenAI Service Error:', error);
    throw new Error(`Failed to generate recommendations: ${error.message}`);
  }
};

export interface SelectedPlace {
  name: string;
  district: string;
  category: string;
  lat: number;
  lng: number;
  description?: string;
  estimatedCost?: number;
}

export interface OptimizeItineraryRequest {
  places: SelectedPlace[];
  days: number;
  budget: string;
  startPoint?: string;
}

export interface DayItinerary {
  district: string;
  places: string[];
}

export interface OptimizeItineraryResponse {
  itinerary: {
    [day: string]: DayItinerary;
  };
}

/**
 * Geographically optimize a custom list of selected places across days
 */
export const optimizeItinerary = async (
  params: OptimizeItineraryRequest
): Promise<OptimizeItineraryResponse> => {
  const { places, days, budget, startPoint } = params;

  if (!places || places.length === 0) {
    throw new Error('No places provided for itinerary optimization');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable. Please configure it in your backend .env file.');
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `You are a premium AI Route Optimizer and Itinerary Planner specializing in Sri Lanka.
Your job is to take a specific list of user-selected attractions and distribute them logically across the requested number of travel days.

You MUST respond with a valid JSON object matching the following structure exactly:
{
  "itinerary": {
    "day1": {
      "district": "Major District for Day 1",
      "places": [
        "Exact Attraction Name",
        "Exact Attraction Name"
      ]
    },
    "day2": {
      "district": "Major District for Day 2",
      "places": [
        "Exact Attraction Name"
      ]
    }
  }
}

Guidelines:
1. You MUST distribute ALL the user-selected attractions provided in the list below across the requested travel days (days = ${days}). Do not omit any attractions.
2. Optimize the order of attractions within and across days to minimize travel distance (geographically logical sequence).
${startPoint ? `3. The trip starts at the following location: "${startPoint}". You MUST plan Day 1 to start from or be geographically nearest to this starting point, sequencing subsequent days logically from there to ensure smooth travel without distance conflicts.` : ''}
4. Determine the "district" representing the primary location/focus for each day (e.g. "Kandy" or "Ella" or "Galle"), based on the districts of the places visited on that day.
5. If there are fewer attractions than days, some days can have empty places. If there are more attractions than days, distribute them logically (e.g., 2-3 places per day).
6. Ensure the attraction names in the itinerary match the names of the attractions exactly as provided in the selected list.
7. Return ONLY the raw JSON object. Do not include markdown formatting like \`\`\`json or regular text.`;

  const userPrompt = `User Selected Attractions:
${JSON.stringify(places, null, 2)}

Travel Preference:
- Budget Category: ${budget}
- Number of Days: ${days}

Generate the optimized day-by-day itinerary JSON now.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) {
      throw new Error('Received empty response from OpenAI');
    }

    const jsonResponse = JSON.parse(resultText) as OptimizeItineraryResponse;
    return jsonResponse;
  } catch (error: any) {
    console.error('❌ OpenAI Optimize Service Error:', error);
    throw new Error(`Failed to optimize itinerary: ${error.message}`);
  }
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Handle conversational chatbot messages with OpenAI
 */
export const chatWithAi = async (messages: ChatMessage[]): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable. Please configure it in your backend .env file.');
  }

  const openai = new OpenAI({ apiKey });

  const systemMessage: ChatMessage = {
    role: 'system',
    content: `You are "Antigravity Travel Assistant", a premium AI chatbot built into the Sri Lankan Trip Planner application.
Your goal is to assist the user dynamically with any travel questions, descriptions of places, cultural context, food recommendations, and travel guidelines in Sri Lanka.
Keep your responses helpful, engaging, and concise (under 2-3 short paragraphs).
If the user asks about a specific attraction (e.g. Galle Fort, Sigiriya, Temple of the Tooth, Nuwara Eliya, Ella), provide a rich, captivating description including its history, entrance fees (if applicable), best time to visit, and insider travel tips.`
  };

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = response.choices[0]?.message?.content;
    if (!reply) {
      throw new Error('Received empty response from OpenAI chatbot');
    }

    return reply;
  } catch (error: any) {
    console.error('❌ OpenAI Chat Bot Service Error:', error);
    throw new Error(`Chatbot failed: ${error.message}`);
  }
};


