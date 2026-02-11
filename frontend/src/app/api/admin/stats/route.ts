import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/dbCollections';

// GET - Admin statistics
export async function GET() {
  try {
    const usersCollection = await getCollection(Collections.USERS);
    const tripsCollection = await getCollection(Collections.TRIPS);
    const bookingsCollection = await getCollection(Collections.BOOKINGS);
    
    // Get statistics
    const totalUsers = await usersCollection.countDocuments();
    const activeUsers = await usersCollection.countDocuments({ isActive: true });
    const totalTrips = await tripsCollection.countDocuments();
    const totalBookings = await bookingsCollection.countDocuments();
    
    // Get all users with additional info
    const users = await usersCollection.find({}).toArray();
    
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalTrips,
          totalBookings
        },
        users: users.map(user => ({
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          role: user.role || 'USER',
          profilePicture: user.profilePicture,
          joinedDate: user.createdAt || user.joinedDate,
          lastActive: user.lastActive || user.updatedAt,
          isActive: user.isActive ?? true,
          tripsCount: user.tripsCount || 0,
          placesVisited: user.placesVisited || 0,
          country: user.country || '',
          phoneNumber: user.phoneNumber || ''
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
