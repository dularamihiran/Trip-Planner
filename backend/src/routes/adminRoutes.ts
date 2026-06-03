import { Router, Request, Response } from 'express';
import { getDatabase } from '../config/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';

const router = Router();

// Get all users (Admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const users = await db.collection<User>('users')
      .find({}, { projection: { password: 0 } })
      .toArray();
    
    // Add real trip counts from database for each user
    const usersWithTripCounts = await Promise.all(
      users.map(async (user) => {
        const tripsCount = await db.collection('trips').countDocuments({ userId: user.userId });
        return {
          ...user,
          tripsCount
        };
      })
    );
    
    res.json({ success: true, data: usersWithTripCounts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get admin statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    const totalUsers = await db.collection('users').countDocuments();
    const activeUsers = await db.collection('users').countDocuments({ isActive: true });
    const totalTrips = await db.collection('trips').countDocuments();
    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalTrips
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const db = await getDatabase();
    const user = await db.collection<User>('users').findOne({ email, role: 'ADMIN' });
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          userId: user.userId,
          fullName: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete user
router.delete('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = await getDatabase();
    
    const result = await db.collection('users').deleteOne({ userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
