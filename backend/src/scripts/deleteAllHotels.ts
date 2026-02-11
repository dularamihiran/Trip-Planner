/**
 * Delete ALL hotels from DynamoDB
 * WARNING: This will permanently delete all hotel data!
 */

import { ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, Tables } from '../config/database';

async function deleteAllHotels() {
  try {
    console.log('⚠️  WARNING: This will delete ALL hotels from DynamoDB!\n');

    // Scan all hotels
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: Tables.HOTELS,
      })
    );

    const hotels = result.Items || [];
    console.log(`📊 Found ${hotels.length} hotels to delete\n`);

    if (hotels.length === 0) {
      console.log('✅ No hotels to delete!');
      return;
    }

    // Delete all hotels
    for (const hotel of hotels) {
      console.log(`🗑️  Deleting: ${hotel.name} (${hotel.hotelId})`);
      await dynamoDB.send(
        new DeleteCommand({
          TableName: Tables.HOTELS,
          Key: { hotelId: hotel.hotelId },
        })
      );
    }

    console.log('\n✅ All hotels deleted!');
    console.log(`Total deleted: ${hotels.length}`);

  } catch (error) {
    console.error('❌ Error during deletion:', error);
  }
}

// Run deletion
deleteAllHotels().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
});
