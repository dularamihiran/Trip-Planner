import { NextResponse } from 'next/server';
import clientPromise, { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    // Test MongoDB connection
    const client = await clientPromise;
    const db = await getDatabase();
    
    // Ping the database
    await client.db().admin().ping();
    
    // Get list of collections
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!',
      database: db.databaseName,
      collections: collections.map(col => col.name),
      connectionStatus: 'Connected'
    });
  } catch (error: any) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to MongoDB',
        details: error.message
      },
      { status: 500 }
    );
  }
}
