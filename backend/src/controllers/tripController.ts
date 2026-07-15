import { Request, Response } from 'express';
import { TripService } from '../services/tripService';

export const createTripHandler = async (req: Request, res: Response) => {
    try {
        const tripData = req.body;

        // Validate required fields
        if (!tripData.userId || !tripData.tripName || !tripData.startDate || !tripData.endDate) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['userId', 'tripName', 'startDate', 'endDate'],
            });
        }

        const trip = await TripService.createTrip(tripData);
        return res.status(201).json({
            message: 'Trip created successfully',
            trip,
        });
    } catch (error: any) {
        console.error('Error creating trip:', error);
        return res.status(500).json({ error: 'Failed to create trip', details: error.message });
    }
};

export const getUserTripsHandler = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const status = req.query.status as string | undefined;

        const trips = await TripService.getUserTrips(userId, status);
        return res.json({
            count: trips.length,
            trips,
        });
    } catch (error: any) {
        console.error('Error fetching user trips:', error);
        return res.status(500).json({ error: 'Failed to fetch trips', details: error.message });
    }
};

export const getTripByIdHandler = async (req: Request, res: Response) => {
    try {
        const { tripId } = req.params;
        const trip = await TripService.getTripById(tripId);

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        return res.json(trip);
    } catch (error: any) {
        console.error('Error fetching trip:', error);
        return res.status(500).json({ error: 'Failed to fetch trip', details: error.message });
    }
};

export const updateTripHandler = async (req: Request, res: Response) => {
    try {
        const { tripId } = req.params;
        const updates = req.body;

        const trip = await TripService.updateTrip(tripId, updates);

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        return res.json({
            message: 'Trip updated successfully',
            trip,
        });
    } catch (error: any) {
        console.error('Error updating trip:', error);
        return res.status(500).json({ error: 'Failed to update trip', details: error.message });
    }
};

export const deleteTripHandler = async (req: Request, res: Response) => {
    try {
        const { tripId } = req.params;
        const isDeleted = await TripService.deleteTrip(tripId);

        if (!isDeleted) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        return res.json({ message: 'Trip deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting trip:', error);
        return res.status(500).json({ error: 'Failed to delete trip', details: error.message });
    }
};

export const addPlaceToTripHandler = async (req: Request, res: Response) => {
    try {
        const { tripId } = req.params;
        const placeData = req.body;

        // Validate required fields
        if (!placeData.name || !placeData.category || !placeData.district) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['name', 'category', 'district'],
            });
        }

        const place = await TripService.addPlaceToTrip(tripId, placeData);
        return res.status(201).json({
            message: 'Place added to trip successfully',
            place,
        });
    } catch (error: any) {
        console.error('Error adding place:', error);
        if (error.message === 'Trip not found') {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to add place', details: error.message });
    }
};

export const getTripPlacesHandler = async (req: Request, res: Response) => {
    try {
        const { tripId } = req.params;
        const places = await TripService.getTripPlaces(tripId);
        return res.json({
            count: places.length,
            places,
        });
    } catch (error: any) {
        console.error('Error fetching places:', error);
        return res.status(500).json({ error: 'Failed to fetch places', details: error.message });
    }
};

export const updateTripPlaceHandler = async (req: Request, res: Response) => {
    try {
        const { tripId, placeId } = req.params;
        const { visitStatus, visitDate, visitTime, notes } = req.body;

        const updatedPlace = await TripService.updateTripPlace(tripId, placeId, {
            visitStatus,
            visitDate,
            visitTime,
            notes,
        });

        if (!updatedPlace) {
            return res.status(404).json({ error: 'Place not found in this trip' });
        }

        return res.json({
            message: 'Place updated successfully',
            place: updatedPlace,
        });
    } catch (error: any) {
        console.error('Error updating place:', error);
        return res.status(500).json({ error: 'Failed to update place', details: error.message });
    }
};

export const removePlaceFromTripHandler = async (req: Request, res: Response) => {
    try {
        const { tripId, placeId } = req.params;
        const isRemoved = await TripService.removePlaceFromTrip(tripId, placeId);

        if (!isRemoved) {
            return res.status(404).json({ error: 'Place not found or already removed' });
        }

        return res.json({ message: 'Place removed successfully' });
    } catch (error: any) {
        console.error('Error removing place:', error);
        return res.status(500).json({ error: 'Failed to remove place', details: error.message });
    }
};

export const removeAllPlacesFromTripHandler = async (req: Request, res: Response) => {
    try {
        const { tripId } = req.params;
        await TripService.removeAllPlacesFromTrip(tripId);
        return res.json({ message: 'All places removed successfully from trip' });
    } catch (error: any) {
        console.error('Error removing all places:', error);
        return res.status(500).json({ error: 'Failed to remove all places', details: error.message });
    }
};

export const suggestPlacesHandler = async (req: Request, res: Response) => {
    try {
        const { districts, interests, budget, travelers, startDate, endDate } = req.body;

        console.log('🔍 Suggesting places with filters:', { districts, interests, budget });

        // Validate required fields
        if (!districts || !Array.isArray(districts) || districts.length === 0) {
            return res.status(400).json({
                error: 'Districts are required and must be a non-empty array',
            });
        }

        if (interests !== undefined && !Array.isArray(interests)) {
            return res.status(400).json({
                error: 'Interests must be an array of strings',
            });
        }

        const result = await TripService.suggestPlaces({
            districts,
            interests,
            budget,
            travelers,
            startDate,
            endDate,
        });

        return res.json(result);
    } catch (error: any) {
        console.error('❌ Error suggesting places:', error);
        return res.status(500).json({ error: 'Failed to suggest places', details: error.message });
    }
};
