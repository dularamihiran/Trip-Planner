// Database collection names
export const Collections = {
  USERS: 'users',
  TRIPS: 'trips',
  BOOKINGS: 'bookings',
  DESTINATIONS: 'destinations',
  HOTELS: 'hotels',
} as const;

// Database indexes (to be created on first run)
export const createIndexes = async (db: any) => {
  try {
    // Users collection indexes
    await db.collection(Collections.USERS).createIndex({ email: 1 }, { unique: true });
    await db.collection(Collections.USERS).createIndex({ userId: 1 }, { unique: true });
    
    // Trips collection indexes
    await db.collection(Collections.TRIPS).createIndex({ tripId: 1 }, { unique: true });
    await db.collection(Collections.TRIPS).createIndex({ userId: 1 });
    
    // Bookings collection indexes
    await db.collection(Collections.BOOKINGS).createIndex({ bookingId: 1 }, { unique: true });
    await db.collection(Collections.BOOKINGS).createIndex({ userId: 1 });
    await db.collection(Collections.BOOKINGS).createIndex({ tripId: 1 });
    
    // Destinations collection indexes
    await db.collection(Collections.DESTINATIONS).createIndex({ destinationId: 1 }, { unique: true });
    
    // Hotels collection indexes
    await db.collection(Collections.HOTELS).createIndex({ hotelId: 1 }, { unique: true });
    await db.collection(Collections.HOTELS).createIndex({ destinationId: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};
