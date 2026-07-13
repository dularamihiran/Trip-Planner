import { Request, Response } from 'express';
import { getRecommendation, RecommendationRequest, optimizeItinerary, OptimizeItineraryRequest, chatWithAi } from '../services/aiService';

/**
 * Handles POST /api/ai/recommend-trip requests
 */
export const recommendTripHandler = async (req: Request, res: Response) => {
  try {
    const { districts, interests, budget, days } = req.body;

    // 1. Backend validation check
    if (!districts || !Array.isArray(districts) || districts.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'districts is required and must be a non-empty array of strings',
      });
    }

    if (interests !== undefined && !Array.isArray(interests)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'interests must be an array of strings',
      });
    }

    if (!budget || typeof budget !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'budget is required and must be a string',
      });
    }

    const travelDays = Number(days);
    if (isNaN(travelDays) || travelDays <= 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'days is required and must be a positive number',
      });
    }

    const recommendationParams: RecommendationRequest = {
      districts,
      interests: interests || [],
      budget,
      days: travelDays,
    };

    console.log('🤖 AI Planner: Incoming recommendation request with preferences:', recommendationParams);

    // 2. Invoke recommendation generation
    const response = await getRecommendation(recommendationParams);

    // 3. Return response to frontend
    return res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ AI Controller Error:', error);
    return res.status(500).json({
      error: 'AI Generation Failed',
      message: error.message || 'An unexpected error occurred while generating AI recommendations.',
    });
  }
};

/**
 * Handles POST /api/ai/optimize-itinerary requests
 */
export const optimizeItineraryHandler = async (req: Request, res: Response) => {
  try {
    const { places, days, budget, startPoint } = req.body;

    // Validation checks
    if (!places || !Array.isArray(places) || places.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'places is required and must be a non-empty array of selected attractions',
      });
    }

    if (!budget || typeof budget !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'budget is required and must be a string',
      });
    }

    const travelDays = Number(days);
    if (isNaN(travelDays) || travelDays <= 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'days is required and must be a positive number',
      });
    }

    const optimizeParams: OptimizeItineraryRequest = {
      places,
      days: travelDays,
      budget,
      startPoint: startPoint ? String(startPoint) : undefined,
    };

    console.log('🤖 AI Planner: Incoming itinerary optimization request with:', optimizeParams);

    const response = await optimizeItinerary(optimizeParams);

    return res.status(200).json(response);
  } catch (error: any) {
    console.error('❌ AI Controller Optimize Error:', error);
    return res.status(500).json({
      error: 'Itinerary Optimization Failed',
      message: error.message || 'An unexpected error occurred while optimizing your itinerary with AI.',
    });
  }
};

/**
 * Handles POST /api/ai/chat requests for general AI Travel Assistant chatbot
 */
export const chatbotHandler = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'messages parameter is required and must be an array of conversational chat items',
      });
    }

    console.log(`💬 AI Chatbot: Incoming query with history of ${messages.length} messages`);

    const reply = await chatWithAi(messages);

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('❌ AI Controller Chat Error:', error);
    return res.status(500).json({
      error: 'Chatbot communication failed',
      message: error.message || 'An unexpected error occurred in AI chatbot handler.',
    });
  }
};
