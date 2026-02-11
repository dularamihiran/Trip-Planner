/**
 * Seed Booking Data
 * Adds sample booking data to MongoDB for testing the hotel count feature
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.DB_NAME || 'trip_planner';

const sampleBookings = [
  {
    bookingId: 'booking-001',
    userId: 'user-123', // Replace with actual user ID if needed
    tripId: 'trip-001', // Replace with your actual trip ID
    hotelId: 'hotel-001',
    hotelName: 'Cinnamon Grand Colombo',
    checkInDate: '2026-02-20',
    checkOutDate: '2026-02-23',
    numberOfRooms: 1,
    numberOfGuests: 2,
    totalPrice: 45000,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    guestPhone: '+94771234567',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    bookingId: 'booking-002',
    userId: 'user-123',
    tripId: 'trip-001', // Same trip ID
    hotelId: 'hotel-002',
    hotelName: 'Jetwing Blue Negombo',
    checkInDate: '2026-02-23',
    checkOutDate: '2026-02-26',
    numberOfRooms: 1,
    numberOfGuests: 2,
    totalPrice: 38000,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    guestPhone: '+94771234567',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function seedBookings() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db(dbName);
    const bookingsCollection = db.collection('bookings');

    // Clear existing booking data (optional)
    console.log('🗑️ Clearing existing bookings...');
    await bookingsCollection.deleteMany({});

    // Insert sample bookings
    console.log('📝 Inserting sample booking data...');
    const result = await bookingsCollection.insertMany(sampleBookings);
    
    console.log(`✅ Successfully inserted ${result.insertedCount} bookings`);
    console.log('📊 Booking IDs:', Object.values(result.insertedIds));
    
    console.log('\n📋 Sample bookings created:');
    sampleBookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.hotelName} (${booking.checkInDate} to ${booking.checkOutDate})`);
    });

    console.log('\n🎉 Booking seed data completed successfully!');
    console.log('💡 Note: Make sure the tripId matches your actual trip ID in the database');
    
  } catch (error) {
    console.error('❌ Error seeding booking data:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔐 MongoDB connection closed');
    }
  }
}

// Run the seed function
seedBookings().catch(console.error);