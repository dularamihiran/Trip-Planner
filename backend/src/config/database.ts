import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const region = process.env.AWS_REGION || 'eu-north-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// Create DynamoDB client with credentials
const client = new DynamoDBClient({
  region,
  ...(accessKeyId && secretAccessKey && {
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  }),
});

// Create DynamoDB Document client for easier JSON operations
// This marshalls/unmarshalls data automatically
export const dynamoDB = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true, // Remove undefined values from objects
    convertClassInstanceToMap: true, // Convert class instances to maps
  },
  unmarshallOptions: {
    wrapNumbers: false, // Don't wrap numbers in objects
  },
});

// Table names from environment variables
export const Tables = {
  USERS: process.env.USERS_TABLE || 'TripPlanner-Users',
  HOTELS: process.env.HOTELS_TABLE || 'TripPlanner-Hotels',
  TRIPS: process.env.TRIPS_TABLE || 'TripPlanner-Trips',
  BOOKINGS: process.env.BOOKINGS_TABLE || 'TripPlanner-Bookings',
  PLACES: process.env.PLACES_TABLE || 'TripPlanner-Places',
};

/**
 * Initialize DynamoDB connection
 * Logs configuration details for debugging
 */
export const initializeDynamoDB = async (): Promise<void> => {
  try {
    console.log('✅ DynamoDB Document Client initialized');
    console.log(`📍 Region: ${region}`);
    console.log(`📚 Tables configured:`);
    console.log(`   - Users: ${Tables.USERS}`);
    console.log(`   - Hotels: ${Tables.HOTELS}`);
    console.log(`   - Trips: ${Tables.TRIPS}`);
    console.log(`   - Bookings: ${Tables.BOOKINGS}`);
    console.log(`   - Places: ${Tables.PLACES}`);
  } catch (error) {
    console.error('❌ DynamoDB initialization error:', error);
    throw error;
  }
};

export default dynamoDB;

