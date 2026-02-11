import { 
  DynamoDBClient, 
  CreateTableCommand, 
  ListTablesCommand,
  DescribeTableCommand,
  ScalarAttributeType,
  KeyType,
  ProjectionType 
} from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

const tables = [
  {
    TableName: process.env.DYNAMODB_USERS_TABLE || 'trip_planner_users',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' as KeyType },
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'email', AttributeType: 'S' as ScalarAttributeType },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' as KeyType },
        ],
        Projection: {
          ProjectionType: 'ALL' as ProjectionType,
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  },
  {
    TableName: process.env.DYNAMODB_TRIPS_TABLE || 'trip_planner_trips',
    KeySchema: [
      { AttributeName: 'tripId', KeyType: 'HASH' as KeyType },
    ],
    AttributeDefinitions: [
      { AttributeName: 'tripId', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'userId', AttributeType: 'S' as ScalarAttributeType },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' as KeyType },
        ],
        Projection: {
          ProjectionType: 'ALL' as ProjectionType,
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  },
  {
    TableName: process.env.DYNAMODB_BOOKINGS_TABLE || 'trip_planner_bookings',
    KeySchema: [
      { AttributeName: 'bookingId', KeyType: 'HASH' as KeyType },
    ],
    AttributeDefinitions: [
      { AttributeName: 'bookingId', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'userId', AttributeType: 'S' as ScalarAttributeType },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' as KeyType },
        ],
        Projection: {
          ProjectionType: 'ALL' as ProjectionType,
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  },
  {
    TableName: process.env.DYNAMODB_PLACES_TABLE || 'trip_planner_places',
    KeySchema: [
      { AttributeName: 'placeId', KeyType: 'HASH' as KeyType },
    ],
    AttributeDefinitions: [
      { AttributeName: 'placeId', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'tripId', AttributeType: 'S' as ScalarAttributeType },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'TripIdIndex',
        KeySchema: [
          { AttributeName: 'tripId', KeyType: 'HASH' as KeyType },
        ],
        Projection: {
          ProjectionType: 'ALL' as ProjectionType,
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  },
];

async function createTables() {
  try {
    console.log('🚀 Starting DynamoDB table creation...\n');

    // Check existing tables
    const existingTables = await client.send(new ListTablesCommand({}));
    console.log('📋 Existing tables:', existingTables.TableNames);

    for (const table of tables) {
      if (existingTables.TableNames?.includes(table.TableName)) {
        console.log(`✅ Table ${table.TableName} already exists`);
        continue;
      }

      console.log(`📝 Creating table: ${table.TableName}...`);
      
      await client.send(new CreateTableCommand({
        ...table,
        BillingMode: 'PROVISIONED',
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      }));

      console.log(`✅ Table ${table.TableName} created successfully`);
    }

    console.log('\n🎉 All tables created successfully!');
    console.log('\n📚 Created tables:');
    tables.forEach(t => console.log(`   - ${t.TableName}`));
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

createTables();
