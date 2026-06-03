import express from 'express';
import { recommendTripHandler, optimizeItineraryHandler, chatbotHandler } from '../controllers/aiController';

const router = express.Router();

/**
 * POST /api/ai/recommend-trip
 * Generate AI-powered attraction recommendations and day-by-day itineraries based on user preferences.
 */
router.post('/recommend-trip', recommendTripHandler);

/**
 * POST /api/ai/optimize-itinerary
 * Distribute a specific list of selected places across days and optimize their order geographically.
 */
router.post('/optimize-itinerary', optimizeItineraryHandler);

/**
 * POST /api/ai/chat
 * General chatbot helper utilizing gpt-3.5-turbo to chat with users about attraction context.
 */
router.post('/chat', chatbotHandler);

export default router;
