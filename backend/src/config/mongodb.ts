import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import dns from 'dns';

// Override default DNS servers with public DNS (Google & Cloudflare) to resolve Atlas clusters when local ISPs fail.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Custom lookup to ensure MongoClient resolves hostnames (including replica set nodes) via public DNS.
const customLookup = (
  hostname: string,
  options: any,
  callback: (err: any, address: any, family?: number) => void
) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const family = options.family || 0;
  const all = options.all || false;

  const handleResolveResult = (err: any, addresses: string[], addressFamily: number) => {
    if (err || !addresses || addresses.length === 0) {
      dns.lookup(hostname, options, callback);
      return;
    }

    if (all) {
      const results = addresses.map(addr => ({ address: addr, family: addressFamily }));
      callback(null, results);
    } else {
      callback(null, addresses[0], addressFamily);
    }
  };

  if (family === 6) {
    resolver.resolve6(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        resolver.resolve4(hostname, (err4, addresses4) => {
          handleResolveResult(err4, addresses4 || [], 4);
        });
      } else {
        handleResolveResult(null, addresses, 6);
      }
    });
  } else {
    resolver.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        resolver.resolve6(hostname, (err6, addresses6) => {
          handleResolveResult(err6, addresses6 || [], 6);
        });
      } else {
        handleResolveResult(null, addresses, 4);
      }
    });
  }
};

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
        lookup: customLookup,
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
        lookup: customLookup,
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
  TRIPS: 'trips',
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
