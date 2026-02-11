import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getCollection, Collections } from '../config/mongodb';
import { Hotel, CreateHotelDTO, UpdateHotelDTO, HotelSearchFilters } from '../models/hotelModel';
import { createHotelImageUploadUrl, createBatchUploadUrls } from '../services/s3Service';

const router = express.Router();

/**
 * POST /api/hotels
 * Create a new hotel listing
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const hotelData: CreateHotelDTO = req.body;

    // Validate required fields
    if (!hotelData.name || !hotelData.district || !hotelData.price || !hotelData.rooms || !hotelData.ownerId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'district', 'price', 'rooms', 'ownerId'],
      });
    }

    const hotelId = uuidv4();
    const now = new Date().toISOString();

    const hotel: Hotel = {
      hotelId,
      ...hotelData,
      images: [],
      availableRooms: hotelData.rooms,
      rating: 0,
      totalReviews: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    // Save to MongoDB
    const hotelsCollection = await getCollection(Collections.HOTELS);
    await hotelsCollection.insertOne(hotel as any);

    res.status(201).json({
      message: 'Hotel created successfully',
      hotel,
    });
  } catch (error: any) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ error: 'Failed to create hotel', details: error.message });
  }
});

/**
 * GET /api/hotels/:hotelId
 * Get hotel details by ID
 */
router.get('/:hotelId', async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;

    const hotelsCollection = await getCollection(Collections.HOTELS);
    const hotel = await hotelsCollection.findOne({ hotelId });

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json(hotel);
  } catch (error: any) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ error: 'Failed to fetch hotel', details: error.message });
  }
});

/**
 * GET /api/hotels
 * Get all hotels or search with filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters: HotelSearchFilters = {
      district: req.query.district as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
    };

    const hotelsCollection = await getCollection(Collections.HOTELS);
    let hotels = await hotelsCollection.find({}).toArray() as any[];

    // Apply filters
    if (filters.district) {
      hotels = hotels.filter((h: any) => h.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters.minPrice) {
      hotels = hotels.filter((h: any) => h.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      hotels = hotels.filter((h: any) => h.price <= filters.maxPrice!);
    }
    if (filters.minRating) {
      hotels = hotels.filter((h: any) => (h.rating || 0) >= filters.minRating!);
    }

    // Only show active hotels
    hotels = hotels.filter((h: any) => h.isActive);

    res.json({
      count: hotels.length,
      hotels,
    });
  } catch (error: any) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ error: 'Failed to fetch hotels', details: error.message });
  }
});

/**
 * PUT /api/hotels/:hotelId
 * Update hotel information
 */
router.put('/:hotelId', async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const updates: UpdateHotelDTO = req.body;

    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Remove hotelId from updates
    delete (updateData as any).hotelId;

    const hotelsCollection = await getCollection(Collections.HOTELS);
    const result = await hotelsCollection.findOneAndUpdate(
      { hotelId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json({
      message: 'Hotel updated successfully',
      hotel: result,
    });
  } catch (error: any) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ error: 'Failed to update hotel', details: error.message });
  }
});

/**
 * DELETE /api/hotels/:hotelId
 * Delete a hotel (soft delete - set isActive to false)
 */
router.delete('/:hotelId', async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;

    const hotelsCollection = await getCollection(Collections.HOTELS);
    await hotelsCollection.updateOne(
      { hotelId },
      { 
        $set: { 
          isActive: false, 
          updatedAt: new Date().toISOString() 
        } 
      }
    );

    res.json({ message: 'Hotel deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ error: 'Failed to delete hotel', details: error.message });
  }
});

/**
 * POST /api/hotels/:hotelId/upload-url
 * Generate presigned URL for image upload
 */
router.post('/:hotelId/upload-url', async (req: Request, res: Response) => {
  try {
    const { filename, contentType } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const uploadData = await createHotelImageUploadUrl(
      filename,
      contentType || 'image/jpeg'
    );

    res.json(uploadData);
  } catch (error: any) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL', details: error.message });
  }
});

/**
 * PATCH /api/hotels/:hotelId/images
 * Add image URLs to hotel after upload
 */
router.patch('/:hotelId/images', async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const hotelsCollection = await getCollection(Collections.HOTELS);
    const hotel = await hotelsCollection.findOne({ hotelId });

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const images = (hotel as any).images || [];
    images.push(imageUrl);

    // Update hotel with new image
    await hotelsCollection.updateOne(
      { hotelId },
      { 
        $set: { 
          images, 
          updatedAt: new Date().toISOString() 
        } 
      }
    );

    res.json({
      message: 'Image added successfully',
      images,
    });
  } catch (error: any) {
    console.error('Error adding image:', error);
    res.status(500).json({ error: 'Failed to add image', details: error.message });
  }
});

/**
 * GET /api/hotels/owner/:ownerId
 * Get all hotels by owner
 */
router.get('/owner/:ownerId', async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;

    const hotelsCollection = await getCollection(Collections.HOTELS);
    const hotels = await hotelsCollection.find({ ownerId }).toArray();

    res.json({
      count: hotels.length,
      hotels,
    });
  } catch (error: any) {
    console.error('Error fetching owner hotels:', error);
    res.status(500).json({ error: 'Failed to fetch hotels', details: error.message });
  }
});

export default router;
