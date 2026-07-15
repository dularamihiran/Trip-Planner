import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/mongodb';
import { User, SafeUser } from '../models';

export interface AdminLoginResult {
    token: string;
    user: {
        userId: string;
        fullName: string;
        email: string;
        role: string;
    };
}

export interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalTrips: number;
}

export interface UserWithTripCount extends SafeUser {
    tripsCount: number;
}

/**
 * Service handling all administrative backend operations
 */
export class AdminService {
    /**
     * Get all users, including their real trip counts, excluding passwords
     */
    static async getAllUsers(): Promise<UserWithTripCount[]> {
        const db = await getDatabase();
        const users = await db.collection<User>('users')
            .find({}, { projection: { password: 0 } })
            .toArray();

        const usersWithTripCounts = await Promise.all(
            users.map(async (user) => {
                const tripsCount = await db.collection('trips').countDocuments({ userId: user.userId });
                return {
                    ...user,
                    tripsCount
                } as UserWithTripCount;
            })
        );

        return usersWithTripCounts;
    }

    /**
     * Get overall system stats for administrators
     */
    static async getStats(): Promise<AdminStats> {
        const db = await getDatabase();

        const totalUsers = await db.collection('users').countDocuments();
        const activeUsers = await db.collection('users').countDocuments({ isActive: true });
        const totalTrips = await db.collection('trips').countDocuments();

        return {
            totalUsers,
            activeUsers,
            totalTrips
        };
    }

    /**
     * Admin-specific login handler
     */
    static async login(email: string, password: string): Promise<AdminLoginResult | null> {
        const db = await getDatabase();
        const user = await db.collection<User>('users').findOne({ email, role: 'ADMIN' });

        if (!user) {
            return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return null;
        }

        const token = jwt.sign(
            { userId: user.userId, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                userId: user.userId,
                fullName: user.name,
                email: user.email,
                role: user.role
            }
        };
    }

    /**
     * Delete a user by userId
     */
    static async deleteUser(userId: string): Promise<boolean> {
        const db = await getDatabase();
        const result = await db.collection('users').deleteOne({ userId });
        return result.deletedCount > 0;
    }
}
