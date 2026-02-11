import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.DB_NAME || 'trip_planner';

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let cachedDb: Db | null = null;

/**
 * Initialize MongoDB connection
 * Creates a singleton connection to MongoDB
 */
export const initializeMongoDB = async (): Promise<void> => {
  try {
    if (!client) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
      });
      clientPromise = client.connect();
    }
    
    await clientPromise;
    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Database: ${dbName}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Get the MongoDB database instance
 * Returns cached database or creates new connection
 */
export const getDatabase = async (): Promise<Db> => {
  if (cachedDb) {
    return cachedDb;
  }

  if (!clientPromise) {
    if (!client) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
      });
      clientPromise = client.connect();
    }
  }

  const mongoClient = await clientPromise;
  cachedDb = mongoClient.db(dbName);
  return cachedDb;
};

/**
 * Get a specific collection from the database
 */
export const getCollection = async (collectionName: string) => {
  const db = await getDatabase();
  return db.collection(collectionName);
};

// Collection names
export const Collections = {
  USERS: 'users',
  HOTELS: 'hotels',
  TRIPS: 'trips',
  BOOKINGS: 'bookings',
  PLACES: 'places',
};

/**
 * Close MongoDB connection
 * Should be called when shutting down the server
 */
export const closeMongoDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    cachedDb = null;
    console.log('✅ MongoDB connection closed');
  }
};
