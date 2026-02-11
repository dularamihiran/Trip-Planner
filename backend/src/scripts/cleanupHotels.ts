/**
 * Clean up duplicate hotels from DynamoDB
 * Run this script to remove all hotels except the ones you want to keep
 */

import { ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, Tables } from '../config/database';

async function cleanupHotels() {
  try {
    console.log('🔍 Scanning for all hotels in DynamoDB...\n');

    // Scan all hotels
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: Tables.HOTELS,
      })
    );

    const hotels = result.Items || [];
    console.log(`📊 Found ${hotels.length} hotels in database:\n`);

    // Display all hotels
    hotels.forEach((hotel, index) => {
      console.log(`${index + 1}. ${hotel.name}`);
      console.log(`   ID: ${hotel.hotelId}`);
      console.log(`   Owner: ${hotel.ownerId}`);
      console.log(`   District: ${hotel.district}`);
      console.log(`   Price: Rs. ${hotel.price}`);
      console.log(`   Created: ${hotel.createdAt}`);
      console.log(`   Active: ${hotel.isActive}`);
      console.log('');
    });

    // Find duplicates by name
    const hotelsByName = hotels.reduce((acc: any, hotel) => {
      const name = hotel.name.toLowerCase();
      if (!acc[name]) acc[name] = [];
      acc[name].push(hotel);
      return acc;
    }, {});

    // Identify duplicates
    const duplicates: any[] = [];
    Object.entries(hotelsByName).forEach(([name, hotelList]: [string, any]) => {
      if (hotelList.length > 1) {
        console.log(`⚠️  Found ${hotelList.length} hotels named "${name}"`);
        // Keep the first one (oldest), mark others as duplicates
        for (let i = 1; i < hotelList.length; i++) {
          duplicates.push(hotelList[i]);
        }
      }
    });

    if (duplicates.length === 0) {
      console.log('\n✅ No duplicates found!');
      return;
    }

    console.log(`\n🗑️  Found ${duplicates.length} duplicate hotels to delete:\n`);
    
    // Delete duplicates
    for (const hotel of duplicates) {
      console.log(`Deleting: ${hotel.name} (${hotel.hotelId})`);
      await dynamoDB.send(
        new DeleteCommand({
          TableName: Tables.HOTELS,
          Key: { hotelId: hotel.hotelId },
        })
      );
    }

    console.log('\n✅ Cleanup complete!');
    console.log(`Deleted: ${duplicates.length} duplicate hotels`);
    console.log(`Remaining: ${hotels.length - duplicates.length} unique hotels`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run cleanup
cleanupHotels().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
});
