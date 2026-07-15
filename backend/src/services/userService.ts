import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection, Collections } from '../config/mongodb';
import { User, CreateUserDTO, UpdateUserDTO, SafeUser } from '../models/userModel';

export interface AuthResult {
    message: string;
    user: SafeUser;
    token: string;
}

export class UserService {
    /**
     * Register a new user
     */
    static async register(userData: CreateUserDTO): Promise<AuthResult> {
        const usersCollection = await getCollection(Collections.USERS);
        const existingUser = await usersCollection.findOne({ email: userData.email });

        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const userId = uuidv4();
        const now = new Date().toISOString();

        const user: User = {
            userId,
            email: userData.email,
            name: userData.name,
            password: hashedPassword,
            role: userData.role || 'USER',
            phone: userData.phone,
            createdAt: now,
            updatedAt: now,
        };

        // Save to MongoDB
        await usersCollection.insertOne(user as any);

        // Generate JWT token
        const token = this.generateToken(user);

        const safeUser = this.toSafeUser(user);

        return {
            message: 'User registered successfully',
            user: safeUser,
            token,
        };
    }

    /**
     * Log in a user
     */
    static async login(email: string, password: string): Promise<AuthResult> {
        const usersCollection = await getCollection(Collections.USERS);
        const user = await usersCollection.findOne({ email }) as User | null;

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Generate JWT token
        const token = this.generateToken(user);

        const safeUser = this.toSafeUser(user);

        return {
            message: 'Login successful',
            user: safeUser,
            token,
        };
    }

    /**
     * Find a user by ID
     */
    static async getUserById(userId: string): Promise<SafeUser> {
        const usersCollection = await getCollection(Collections.USERS);
        const user = await usersCollection.findOne({ userId }) as User | null;

        if (!user) {
            throw new Error('User not found');
        }

        return this.toSafeUser(user);
    }

    /**
     * Update user details
     */
    static async updateUser(userId: string, updates: UpdateUserDTO): Promise<SafeUser> {
        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        // Remove userId from updates
        delete (updateData as any).userId;

        const usersCollection = await getCollection(Collections.USERS);
        const result = await usersCollection.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            throw new Error('User not found');
        }

        // Since returnDocument is 'after', result is the updated user
        return this.toSafeUser(result as unknown as User);
    }

    /**
     * Get all users with optional role filtering (excluding passwords)
     */
    static async getAllUsers(role?: string): Promise<SafeUser[]> {
        const usersCollection = await getCollection(Collections.USERS);

        // Build query filter
        const filter: any = {};
        if (role) {
            filter.role = role;
        }

        const users = await usersCollection.find(filter).toArray();

        // Map each to clean SafeUser
        return users.map(user => this.toSafeUser(user as unknown as User));
    }

    /**
     * Delete a user by ID
     */
    static async deleteUser(userId: string): Promise<void> {
        const usersCollection = await getCollection(Collections.USERS);

        // Check if user exists first
        const user = await usersCollection.findOne({ userId });
        if (!user) {
            throw new Error('User not found');
        }

        // Delete the user
        await usersCollection.deleteOne({ userId });
    }

    /**
     * Generate JWT token helper
     */
    private static generateToken(user: User): string {
        return jwt.sign(
            {
                userId: user.userId,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '7d' }
        );
    }

    /**
     * Convert user schema object to safe user object
     */
    private static toSafeUser(user: User): SafeUser {
        const safeUser = { ...user };
        delete (safeUser as any).password;
        if ('_id' in safeUser) {
            delete (safeUser as any)._id;
        }
        return safeUser;
    }
}
