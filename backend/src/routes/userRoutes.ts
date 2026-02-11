import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection, Collections } from '../config/mongodb';
import { User, CreateUserDTO, UpdateUserDTO, SafeUser } from '../models/userModel';
import { createAvatarUploadUrl } from '../services/s3Service';

const router = express.Router();

/**
 * POST /api/users/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const userData: CreateUserDTO = req.body;

    // Validate required fields
    if (!userData.email || !userData.name || !userData.password) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['email', 'name', 'password'],
      });
    }

    // Check if user already exists
    const usersCollection = await getCollection(Collections.USERS);
    const existingUser = await usersCollection.findOne({ email: userData.email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
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
    const token = jwt.sign(
      { 
        userId: user.userId,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Return user without password
    const safeUser: SafeUser = { ...user };
    delete (safeUser as any).password;

    res.status(201).json({
      message: 'User registered successfully',
      user: safeUser,
      token,
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
});

/**
 * POST /api/users/login
 * User login (returns user info if credentials are valid)
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Find user by email
    const usersCollection = await getCollection(Collections.USERS);
    const user = await usersCollection.findOne({ email }) as User | null;

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.userId,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Return user without password
    const safeUser: SafeUser = { ...user };
    delete (safeUser as any).password;

    res.json({
      message: 'Login successful',
      user: safeUser,
      token,
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

/**
 * GET /api/users/:userId
 * Get user profile by ID
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const usersCollection = await getCollection(Collections.USERS);
    const user = await usersCollection.findOne({ userId }) as User | null;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const safeUser: SafeUser = { ...user };
    delete (safeUser as any).password;

    res.json(safeUser);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
});

/**
 * PUT /api/users/:userId
 * Update user profile
 */
router.put('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates: UpdateUserDTO = req.body;

    // Add updatedAt timestamp
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
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result as unknown as User;
    const safeUser: SafeUser = { ...user };
    delete (safeUser as any).password;

    res.json({
      message: 'User updated successfully',
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

/**
 * POST /api/users/:userId/avatar-upload-url
 * Generate presigned URL for avatar upload
 */
router.post('/:userId/avatar-upload-url', async (req: Request, res: Response) => {
  try {
    const { filename, contentType } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const uploadData = await createAvatarUploadUrl(
      filename,
      contentType || 'image/jpeg'
    );

    res.json(uploadData);
  } catch (error: any) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL', details: error.message });
  }
});

/**
 * GET /api/users
 * Get all users (Admin only - add auth middleware in production)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { role } = req.query;

    const usersCollection = await getCollection(Collections.USERS);
    
    // Build query filter
    const filter: any = {};
    if (role) {
      filter.role = role;
    }

    const users = await usersCollection.find(filter).toArray();

    // Remove passwords from all users
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user as any;
      return safeUser;
    });

    res.json({
      count: safeUsers.length,
      users: safeUsers,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

/**
 * DELETE /api/users/:userId
 * Delete a user (Admin only)
 */
router.delete('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const usersCollection = await getCollection(Collections.USERS);
    
    // Check if user exists first
    const user = await usersCollection.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the user
    await usersCollection.deleteOne({ userId });

    res.json({
      message: 'User deleted successfully',
      userId,
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

export default router;
