/**
 * Delete specific hotel by ID
 */

import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, Tables } from '../config/database';

async function deleteSpecificHotel() {
  // Delete "Paradise Beach Resort" (the remaining one)
  const hotelIdToDelete = '271b7cbd-04f1-41b5-9849-6bb438e5fa80';
  
  console.log('🗑️  Deleting Paradise Beach Resort...\n');
  
  try {
    await dynamoDB.send(
      new DeleteCommand({
        TableName: Tables.HOTELS,
        Key: { hotelId: hotelIdToDelete },
      })
    );
    
    console.log('✅ Deleted: Paradise Beach Resort');
    console.log('\nNow only "paradis hotel" remains in the database!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

deleteSpecificHotel().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
});
