import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getCollection, Collections } from '../config/mongodb';
import { Trip, CreateTripDTO, UpdateTripDTO, Place, AddPlaceDTO } from '../models/tripModel';

const router = express.Router();

/**
 * POST /api/trips
 * Create a new trip
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const tripData: CreateTripDTO = req.body;

    // Validate required fields
    if (!tripData.userId || !tripData.tripName || !tripData.startDate || !tripData.endDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['userId', 'tripName', 'startDate', 'endDate'],
      });
    }

    const tripId = uuidv4();
    const now = new Date().toISOString();

    const trip: Trip = {
      tripId,
      userId: tripData.userId,
      tripName: tripData.tripName,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      districts: tripData.districts || [],
      places: [],
      budget: tripData.budget,
      status: 'PLANNING',
      description: tripData.description,
      createdAt: now,
      updatedAt: now,
    };

    // Save to MongoDB
    const tripsCollection = await getCollection(Collections.TRIPS);
    await tripsCollection.insertOne(trip as any);

    res.status(201).json({
      message: 'Trip created successfully',
      trip,
    });
  } catch (error: any) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip', details: error.message });
  }
});

/**
 * GET /api/trips/user/:userId
 * Get all trips for a specific user
 * NOTE: This must come BEFORE /:tripId route to avoid conflict
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const tripsCollection = await getCollection(Collections.TRIPS);
    
    // Build query filter
    const filter: any = { userId };
    if (status) {
      filter.status = status;
    }

    const trips = await tripsCollection.find(filter).toArray();

    res.json({
      count: trips.length,
      trips,
    });
  } catch (error: any) {
    console.error('Error fetching user trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips', details: error.message });
  }
});

/**
 * GET /api/trips/:tripId
 * Get trip details by ID
 */
router.get('/:tripId', async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;

    const tripsCollection = await getCollection(Collections.TRIPS);
    const trip = await tripsCollection.findOne({ tripId });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
  } catch (error: any) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Failed to fetch trip', details: error.message });
  }
});

/**
 * PUT /api/trips/:tripId
 * Update trip information
 */
router.put('/:tripId', async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const updates: UpdateTripDTO = req.body;

    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Remove tripId from updates
    delete (updateData as any).tripId;

    const tripsCollection = await getCollection(Collections.TRIPS);
    const result = await tripsCollection.findOneAndUpdate(
      { tripId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({
      message: 'Trip updated successfully',
      trip: result,
    });
  } catch (error: any) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip', details: error.message });
  }
});

/**
 * DELETE /api/trips/:tripId
 * Delete a trip
 */
router.delete('/:tripId', async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;

    const tripsCollection = await getCollection(Collections.TRIPS);
    await tripsCollection.deleteOne({ tripId });

    res.json({ message: 'Trip deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip', details: error.message });
  }
});

/**
 * POST /api/trips/:tripId/places
 * Add a place to a trip
 */
router.post('/:tripId/places', async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const placeData: AddPlaceDTO = req.body;

    // Validate required fields
    if (!placeData.name || !placeData.category || !placeData.district) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'category', 'district'],
      });
    }

    const placeId = uuidv4();
    const now = new Date().toISOString();

    // Geographically resolve coordinates from master seed places if 0 or missing
    let lat = placeData.latitude || 0;
    let lng = placeData.longitude || 0;

    if (lat === 0 || lng === 0) {
      const masterPlacesColl = await getCollection(Collections.PLACES);
      const masterPlace = await masterPlacesColl.findOne({
        name: { $regex: new RegExp(`^${placeData.name.trim()}$`, 'i') },
        tripId: { $exists: false }
      });

      if (masterPlace) {
        lat = masterPlace.lat || masterPlace.latitude || 0;
        lng = masterPlace.lng || masterPlace.longitude || 0;
        console.log(`🗺️ Backend Coordinate Resolver: Auto-resolved "${placeData.name}" to lat=${lat}, lng=${lng}`);
      }
    }

    const place: Place = {
      placeId,
      tripId,
      name: placeData.name,
      category: placeData.category,
      district: placeData.district,
      city: placeData.city,
      address: placeData.address,
      latitude: lat,
      longitude: lng,
      visitDate: placeData.visitDate,
      visitTime: placeData.visitTime,
      duration: placeData.duration,
      notes: placeData.notes,
      visitStatus: 'PLANNED',
      createdAt: now,
      updatedAt: now,
    };

    // Save place to Places collection
    const placesCollection = await getCollection(Collections.PLACES);
    await placesCollection.insertOne(place as any);

    // Update trip's places array
    const tripsCollection = await getCollection(Collections.TRIPS);
    const trip = await tripsCollection.findOne({ tripId });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const places = trip.places || [];
    places.push(placeId);

    await tripsCollection.updateOne(
      { tripId },
      { $set: { places, updatedAt: now } }
    );

    res.status(201).json({
      message: 'Place added to trip successfully',
      place,
    });
  } catch (error: any) {
    console.error('Error adding place:', error);
    res.status(500).json({ error: 'Failed to add place', details: error.message });
  }
});

/**
 * GET /api/trips/:tripId/places
 * Get all places for a trip
 */
router.get('/:tripId/places', async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;

    const placesCollection = await getCollection(Collections.PLACES);
    const places = await placesCollection.find({ tripId }).toArray();

    res.json({
      count: places.length,
      places,
    });
  } catch (error: any) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Failed to fetch places', details: error.message });
  }
});

/**
 * PATCH /api/trips/:tripId/places/:placeId
 * Update a place's status or notes
 */
router.patch('/:tripId/places/:placeId', async (req: Request, res: Response) => {
  try {
    const { tripId, placeId } = req.params;
    const { visitStatus, visitDate, visitTime, notes } = req.body;

    const placesCollection = await getCollection(Collections.PLACES);
    const place = await placesCollection.findOne({ placeId, tripId });

    if (!place) {
      return res.status(404).json({ error: 'Place not found in this trip' });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (visitStatus !== undefined) updateData.visitStatus = visitStatus;
    if (visitDate !== undefined) updateData.visitDate = visitDate;
    if (visitTime !== undefined) updateData.visitTime = visitTime;
    if (notes !== undefined) updateData.notes = notes;

    await placesCollection.updateOne(
      { placeId, tripId },
      { $set: updateData }
    );

    const updatedPlace = await placesCollection.findOne({ placeId, tripId });

    res.json({
      message: 'Place updated successfully',
      place: updatedPlace
    });
  } catch (error: any) {
    console.error('Error updating place:', error);
    res.status(500).json({ error: 'Failed to update place', details: error.message });
  }
});

/**
 * DELETE /api/trips/:tripId/places/:placeId
 * Remove a place from a trip
 */
router.delete('/:tripId/places/:placeId', async (req: Request, res: Response) => {
  try {
    const { tripId, placeId } = req.params;

    // Delete place from Places collection
    const placesCollection = await getCollection(Collections.PLACES);
    await placesCollection.deleteOne({ placeId });

    // Update trip's places array
    const tripsCollection = await getCollection(Collections.TRIPS);
    const trip = await tripsCollection.findOne({ tripId });

    if (trip) {
      const places = (trip.places || []).filter((id: string) => id !== placeId);
      await tripsCollection.updateOne(
        { tripId },
        { $set: { places, updatedAt: new Date().toISOString() } }
      );
    }

    res.json({ message: 'Place removed successfully' });
  } catch (error: any) {
    console.error('Error removing place:', error);
    res.status(500).json({ error: 'Failed to remove place', details: error.message });
  }
});

/**
 * DELETE /api/trips/:tripId/places
 * Remove all places from a trip
 */
router.delete('/:tripId/places', async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;

    // Delete all places for this trip from Places collection
    const placesCollection = await getCollection(Collections.PLACES);
    await placesCollection.deleteMany({ tripId });

    // Update trip's places array to be empty
    const tripsCollection = await getCollection(Collections.TRIPS);
    await tripsCollection.updateOne(
      { tripId },
      { $set: { places: [], updatedAt: new Date().toISOString() } }
    );

    res.json({ message: 'All places removed successfully from trip' });
  } catch (error: any) {
    console.error('Error removing all places:', error);
    res.status(500).json({ error: 'Failed to remove all places', details: error.message });
  }
});

/**
 * POST /api/trips/suggest-places
 * Get suggested places based on trip preferences
 */
router.post('/suggest-places', async (req: Request, res: Response) => {
  try {
    const { districts, interests, budget, travelers, startDate, endDate } = req.body;

    console.log('🔍 Suggesting places with filters:', { districts, interests, budget });

    // Validate required fields
    if (!districts || !Array.isArray(districts) || districts.length === 0) {
      return res.status(400).json({
        error: 'Districts are required and must be a non-empty array',
      });
    }

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({
        error: 'Interests are required and must be a non-empty array',
      });
    }

    // Get all places from MongoDB
    const placesCollection = await getCollection(Collections.PLACES);
    let places = await placesCollection.find({}).toArray();

    console.log(`📊 Found ${places.length} total places in database`);

    // Filter by districts
    places = places.filter((place: any) => districts.includes(place.district));
    console.log(`📍 After district filter: ${places.length} places`);

    // Filter by interests (categories)
    places = places.filter((place: any) => interests.includes(place.category));
    console.log(`🎯 After category filter: ${places.length} places`);

    // Optional: Filter by budget
    if (budget && travelers && startDate && endDate) {
      // Parse budget range (e.g., "100000-200000")
      const [minBudget, maxBudget] = budget.split('-').map(Number);
      
      // Calculate trip duration
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Filter places within budget
      places = places.filter((place: any) => {
        const totalCost = (place.estimatedCost || 0) * travelers;
        const dailyBudget = maxBudget / days;
        return totalCost <= dailyBudget;
      });

      console.log(`💰 After budget filter: ${places.length} places`);
    }

    // Calculate some helpful stats
    const totalEstimatedCost = places.reduce((sum: number, place: any) => 
      sum + ((place.estimatedCost || 0) * (travelers || 1)), 0
    );

    const placesByDistrict = places.reduce((acc: any, place: any) => {
      acc[place.district] = (acc[place.district] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const placesByCategory = places.reduce((acc: any, place: any) => {
      acc[place.category] = (acc[place.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort places by estimated cost (free places first, then by price)
    places.sort((a: any, b: any) => (a.estimatedCost || 0) - (b.estimatedCost || 0));

    res.json({
      places,
      summary: {
        total: places.length,
        totalEstimatedCost,
        placesByDistrict,
        placesByCategory,
      },
    });

  } catch (error: any) {
    console.error('❌ Error suggesting places:', error);
    res.status(500).json({ error: 'Failed to suggest places', details: error.message });
  }
});

export default router;
