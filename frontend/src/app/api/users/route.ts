import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/dbCollections';

// GET all users
export async function GET() {
  try {
    const usersCollection = await getCollection(Collections.USERS);
    const users = await usersCollection.find({}).toArray();
    
    return NextResponse.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usersCollection = await getCollection(Collections.USERS);
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create new user
    const newUser = {
      ...body,
      userId: body.userId || `user_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await usersCollection.insertOne(newUser);
    
    return NextResponse.json({
      success: true,
      data: { ...newUser, _id: result.insertedId },
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
