import express from 'express';
import {
  createTripHandler,
  getUserTripsHandler,
  getTripByIdHandler,
  updateTripHandler,
  deleteTripHandler,
  addPlaceToTripHandler,
  getTripPlacesHandler,
  updateTripPlaceHandler,
  removePlaceFromTripHandler,
  removeAllPlacesFromTripHandler,
  suggestPlacesHandler,
} from '../controllers/tripController';

const router = express.Router();

/**
 * Create a new trip
 */
router.post('/', createTripHandler);

/**
 * Get all trips for a specific user
 * NOTE: This must come BEFORE /:tripId route to avoid conflicts
 */
router.get('/user/:userId', getUserTripsHandler);

/**
 * Get trip details by ID
 */
router.get('/:tripId', getTripByIdHandler);

/**
 * Update trip information
 */
router.put('/:tripId', updateTripHandler);

/**
 * Delete a trip
 */
router.delete('/:tripId', deleteTripHandler);

/**
 * Add a place to a trip
 */
router.post('/:tripId/places', addPlaceToTripHandler);

/**
 * Get all places for a trip
 */
router.get('/:tripId/places', getTripPlacesHandler);

/**
 * Update a place's status or notes in a trip
 */
router.patch('/:tripId/places/:placeId', updateTripPlaceHandler);

/**
 * Remove a place from a trip
 */
router.delete('/:tripId/places/:placeId', removePlaceFromTripHandler);

/**
 * Remove all places from a trip
 */
router.delete('/:tripId/places', removeAllPlacesFromTripHandler);

/**
 * Suggest places based on trip preferences
 */
router.post('/suggest-places', suggestPlacesHandler);

export default router;
