// Script to create DynamoDB tables for local development
// Run this with: node create-tables.js

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  DynamoDBDocumentClient, 
  PutCommand 
} = require('@aws-sdk/lib-dynamodb');
const { 
  CreateTableCommand, 
  DescribeTableCommand 
} = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const tables = [
  {
    TableName: 'TripPlanner-Users',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: 'TripPlanner-Hotels',
    KeySchema: [
      { AttributeName: 'hotelId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'hotelId', AttributeType: 'S' },
      { AttributeName: 'ownerId', AttributeType: 'S' },
      { AttributeName: 'district', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'OwnerIndex',
        KeySchema: [
          { AttributeName: 'ownerId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'DistrictIndex',
        KeySchema: [
          { AttributeName: 'district', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: 'TripPlanner-Trips',
    KeySchema: [
      { AttributeName: 'tripId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'tripId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserTripsIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: 'TripPlanner-Bookings',
    KeySchema: [
      { AttributeName: 'bookingId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'bookingId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'hotelId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserBookingsIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'HotelBookingsIndex',
        KeySchema: [
          { AttributeName: 'hotelId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: 'TripPlanner-Places',
    KeySchema: [
      { AttributeName: 'placeId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'placeId', AttributeType: 'S' },
      { AttributeName: 'tripId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'TripPlacesIndex',
        KeySchema: [
          { AttributeName: 'tripId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }
];

async function checkTableExists(tableName) {
  try {
    await dynamoClient.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function waitForTableActive(tableName) {
  console.log(`⏳ Waiting for table ${tableName} to become ACTIVE...`);
  let attempts = 0;
  const maxAttempts = 60;
  
  while (attempts < maxAttempts) {
    try {
      const response = await dynamoClient.send(
        new DescribeTableCommand({ TableName: tableName })
      );
      
      if (response.Table.TableStatus === 'ACTIVE') {
        console.log(`✅ Table ${tableName} is now ACTIVE`);
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    } catch (error) {
      console.error(`Error checking table status: ${error.message}`);
      throw error;
    }
  }
  
  throw new Error(`Table ${tableName} did not become ACTIVE within timeout`);
}

async function createTables() {
  console.log('🚀 Starting DynamoDB table creation...\n');
  console.log(`📍 Region: ${process.env.AWS_REGION || 'ap-south-1'}\n`);
  
  for (const tableConfig of tables) {
    const tableName = tableConfig.TableName;
    
    try {
      const exists = await checkTableExists(tableName);
      
      if (exists) {
        console.log(`✓ Table ${tableName} already exists`);
        continue;
      }
      
      console.log(`📝 Creating table: ${tableName}...`);
      await dynamoClient.send(new CreateTableCommand(tableConfig));
      console.log(`✅ Table ${tableName} creation initiated`);
      
      await waitForTableActive(tableName);
      
    } catch (error) {
      console.error(`❌ Error with table ${tableName}:`, error.message);
      throw error;
    }
  }
  
  console.log('\n🎉 All tables created successfully!');
  console.log('\n📚 Created tables:');
  console.log('   - TripPlanner-Users');
  console.log('   - TripPlanner-Hotels');
  console.log('   - TripPlanner-Trips');
  console.log('   - TripPlanner-Bookings');
  console.log('   - TripPlanner-Places');
  console.log('\n✅ You can now test your API endpoints!');
}

createTables().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
