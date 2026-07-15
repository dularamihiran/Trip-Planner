import { v4 as uuidv4 } from 'uuid';
import { getCollection, Collections } from '../config/mongodb';
import { Trip, CreateTripDTO, UpdateTripDTO, Place, AddPlaceDTO } from '../models/tripModel';
import { INTEREST_TO_CATEGORIES_MAP } from './aiService';

export interface SuggestPlacesParams {
    districts: string[];
    interests?: string[];
    budget?: string;
    travelers?: number;
    startDate?: string;
    endDate?: string;
}

export interface SuggestPlacesResult {
    places: Place[];
    summary: {
        total: number;
        totalEstimatedCost: number;
        placesByDistrict: Record<string, number>;
        placesByCategory: Record<string, number>;
    };
}

export class TripService {
    /**
     * Create a new trip
     */
    static async createTrip(tripData: CreateTripDTO): Promise<Trip> {
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
            startPoint: tripData.startPoint,
            startPointLat: tripData.startPointLat,
            startPointLng: tripData.startPointLng,
            createdAt: now,
            updatedAt: now,
        };

        const tripsCollection = await getCollection(Collections.TRIPS);
        await tripsCollection.insertOne(trip as any);

        return trip;
    }

    /**
     * Get all trips for a user
     */
    static async getUserTrips(userId: string, status?: string): Promise<Trip[]> {
        const tripsCollection = await getCollection(Collections.TRIPS);

        const filter: any = { userId };
        if (status) {
            filter.status = status;
        }

        const trips = await tripsCollection.find(filter).toArray();
        return trips as unknown as Trip[];
    }

    /**
     * Get details of a single trip
     */
    static async getTripById(tripId: string): Promise<Trip | null> {
        const tripsCollection = await getCollection(Collections.TRIPS);
        const trip = await tripsCollection.findOne({ tripId });
        return trip as unknown as Trip | null;
    }

    /**
     * Update a trip
     */
    static async updateTrip(tripId: string, updates: UpdateTripDTO): Promise<Trip | null> {
        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        delete (updateData as any).tripId;

        const tripsCollection = await getCollection(Collections.TRIPS);
        const result = await tripsCollection.findOneAndUpdate(
            { tripId },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        return result as unknown as Trip | null;
    }

    /**
     * Delete a trip
     */
    static async deleteTrip(tripId: string): Promise<boolean> {
        const tripsCollection = await getCollection(Collections.TRIPS);
        const result = await tripsCollection.deleteOne({ tripId });
        return result.deletedCount > 0;
    }

    /**
     * Add a place to a trip
     */
    static async addPlaceToTrip(tripId: string, placeData: AddPlaceDTO): Promise<Place> {
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

        // Update parent trip's places array
        const tripsCollection = await getCollection(Collections.TRIPS);
        const trip = await tripsCollection.findOne({ tripId });

        if (!trip) {
            throw new Error('Trip not found');
        }

        const places = trip.places || [];
        places.push(placeId);

        await tripsCollection.updateOne(
            { tripId },
            { $set: { places, updatedAt: now } }
        );

        return place;
    }

    /**
     * Fetch all places for a trip
     */
    static async getTripPlaces(tripId: string): Promise<Place[]> {
        const placesCollection = await getCollection(Collections.PLACES);
        const places = await placesCollection.find({ tripId }).toArray();
        return places as unknown as Place[];
    }

    /**
     * Update a place's status/notes in a trip
     */
    static async updateTripPlace(
        tripId: string,
        placeId: string,
        updateFields: { visitStatus?: string; visitDate?: string; visitTime?: string; notes?: string }
    ): Promise<Place | null> {
        const placesCollection = await getCollection(Collections.PLACES);
        const place = await placesCollection.findOne({ placeId, tripId });

        if (!place) {
            return null;
        }

        const updateData: any = {
            updatedAt: new Date().toISOString()
        };

        if (updateFields.visitStatus !== undefined) updateData.visitStatus = updateFields.visitStatus;
        if (updateFields.visitDate !== undefined) updateData.visitDate = updateFields.visitDate;
        if (updateFields.visitTime !== undefined) updateData.visitTime = updateFields.visitTime;
        if (updateFields.notes !== undefined) updateData.notes = updateFields.notes;

        await placesCollection.updateOne(
            { placeId, tripId },
            { $set: updateData }
        );

        const updatedPlace = await placesCollection.findOne({ placeId, tripId });
        return updatedPlace as unknown as Place || null;
    }

    /**
     * Remove a place from a trip
     */
    static async removePlaceFromTrip(tripId: string, placeId: string): Promise<boolean> {
        const placesCollection = await getCollection(Collections.PLACES);
        const deleteResult = await placesCollection.deleteOne({ placeId });

        // Update parent trip's places array
        const tripsCollection = await getCollection(Collections.TRIPS);
        const trip = await tripsCollection.findOne({ tripId });

        if (trip) {
            const places = (trip.places || []).filter((id: string) => id !== placeId);
            await tripsCollection.updateOne(
                { tripId },
                { $set: { places, updatedAt: new Date().toISOString() } }
            );
        }

        return deleteResult.deletedCount > 0;
    }

    /**
     * Remove all places from a trip
     */
    static async removeAllPlacesFromTrip(tripId: string): Promise<void> {
        const placesCollection = await getCollection(Collections.PLACES);
        await placesCollection.deleteMany({ tripId });

        const tripsCollection = await getCollection(Collections.TRIPS);
        await tripsCollection.updateOne(
            { tripId },
            { $set: { places: [], updatedAt: new Date().toISOString() } }
        );
    }

    /**
     * Suggest places based on trip preferences
     */
    static async suggestPlaces(params: SuggestPlacesParams): Promise<SuggestPlacesResult> {
        const { districts, interests, budget, travelers, startDate, endDate } = params;

        const placesCollection = await getCollection(Collections.PLACES);
        let places = await placesCollection.find({ tripId: { $exists: false } }).toArray();

        // Filter by districts
        places = places.filter((place: any) => districts.includes(place.district));

        // Filter by interests (categories) if interests array is provided and not empty
        const dbCategories = new Set<string>();
        if (interests && Array.isArray(interests) && interests.length > 0) {
            interests.forEach((interest) => {
                const mapped = INTEREST_TO_CATEGORIES_MAP[interest] || [interest];
                mapped.forEach((cat) => dbCategories.add(cat));
            });
        }

        if (dbCategories.size > 0) {
            places = places.filter((place: any) => dbCategories.has(place.category));
        }

        // Optional: Filter by budget
        if (budget && travelers && startDate && endDate) {
            const parts = budget.split('-');
            const maxBudget = parts.length > 1 ? Number(parts[1]) : Number(parts[0]);

            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            places = places.filter((place: any) => {
                const totalCost = (place.estimatedCost || 0) * travelers;
                const dailyBudget = maxBudget / days;
                return totalCost <= dailyBudget;
            });
        }

        // stats calculation
        const travelersMultiplier = travelers || 1;
        const totalEstimatedCost = places.reduce(
            (sum: number, place: any) => sum + ((place.estimatedCost || 0) * travelersMultiplier),
            0
        );

        const placesByDistrict = places.reduce((acc: any, place: any) => {
            acc[place.district] = (acc[place.district] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const placesByCategory = places.reduce((acc: any, place: any) => {
            acc[place.category] = (acc[place.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Sort by cost
        places.sort((a: any, b: any) => (a.estimatedCost || 0) - (b.estimatedCost || 0));

        return {
            places: places as unknown as Place[],
            summary: {
                total: places.length,
                totalEstimatedCost,
                placesByDistrict,
                placesByCategory,
            },
        };
    }
}
