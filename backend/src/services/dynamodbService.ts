import { PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, Tables } from '../config/database';
import { User, Trip, Place, Booking } from '../models';
import { v4 as uuidv4 } from 'uuid';

// User Service
export class UserService {
  static async createUser(userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      userId: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dynamoDB.send(new PutCommand({
      TableName: Tables.USERS,
      Item: user,
    }));

    return user;
  }

  static async getUserById(userId: string): Promise<User | null> {
    const result = await dynamoDB.send(new GetCommand({
      TableName: Tables.USERS,
      Key: { userId },
    }));

    return result.Item as User || null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await dynamoDB.send(new ScanCommand({
      TableName: Tables.USERS,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    }));

    return result.Items?.[0] as User || null;
  }

  static async getAllUsers(): Promise<User[]> {
    const result = await dynamoDB.send(new ScanCommand({
      TableName: Tables.USERS,
    }));

    return result.Items as User[] || [];
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.keys(updates).forEach((key, index) => {
      if (key !== 'userId') {
        updateExpressions.push(`#field${index} = :value${index}`);
        expressionAttributeNames[`#field${index}`] = key;
        expressionAttributeValues[`:value${index}`] = (updates as any)[key];
      }
    });

    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';

    const result = await dynamoDB.send(new UpdateCommand({
      TableName: Tables.USERS,
      Key: { userId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return result.Attributes as User;
  }

  static async deleteUser(userId: string): Promise<void> {
    await dynamoDB.send(new DeleteCommand({
      TableName: Tables.USERS,
      Key: { userId },
    }));
  }
}

// Trip Service
export class TripService {
  static async createTrip(tripData: Omit<Trip, 'tripId' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
    const trip: Trip = {
      ...tripData,
      tripId: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dynamoDB.send(new PutCommand({
      TableName: Tables.TRIPS,
      Item: trip,
    }));

    return trip;
  }

  static async getTripById(tripId: string): Promise<Trip | null> {
    const result = await dynamoDB.send(new GetCommand({
      TableName: Tables.TRIPS,
      Key: { tripId },
    }));

    return result.Item as Trip || null;
  }

  static async getTripsByUserId(userId: string): Promise<Trip[]> {
    const result = await dynamoDB.send(new ScanCommand({
      TableName: Tables.TRIPS,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    }));

    return result.Items as Trip[] || [];
  }

  static async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.keys(updates).forEach((key, index) => {
      if (key !== 'tripId') {
        updateExpressions.push(`#field${index} = :value${index}`);
        expressionAttributeNames[`#field${index}`] = key;
        expressionAttributeValues[`:value${index}`] = (updates as any)[key];
      }
    });

    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';

    const result = await dynamoDB.send(new UpdateCommand({
      TableName: Tables.TRIPS,
      Key: { tripId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return result.Attributes as Trip;
  }

  static async deleteTrip(tripId: string): Promise<void> {
    await dynamoDB.send(new DeleteCommand({
      TableName: Tables.TRIPS,
      Key: { tripId },
    }));
  }
}

// Booking Service
export class BookingService {
  static async createBooking(bookingData: Omit<Booking, 'bookingId' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const booking: Booking = {
      ...bookingData,
      bookingId: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dynamoDB.send(new PutCommand({
      TableName: Tables.BOOKINGS,
      Item: booking,
    }));

    return booking;
  }

  static async getBookingById(bookingId: string): Promise<Booking | null> {
    const result = await dynamoDB.send(new GetCommand({
      TableName: Tables.BOOKINGS,
      Key: { bookingId },
    }));

    return result.Item as Booking || null;
  }

  static async getBookingsByUserId(userId: string): Promise<Booking[]> {
    const result = await dynamoDB.send(new ScanCommand({
      TableName: Tables.BOOKINGS,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    }));

    return result.Items as Booking[] || [];
  }
}
