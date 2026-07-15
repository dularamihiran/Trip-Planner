import { Router } from 'express';
import {
  getAllUsersHandler,
  getStatsHandler,
  adminLoginHandler,
  deleteUserHandler,
} from '../controllers/adminController';

const router = Router();

// Get all users (Admin only)
router.get('/', getAllUsersHandler);

// Get admin statistics
router.get('/stats', getStatsHandler);

// Admin login
router.post('/login', adminLoginHandler);

// Delete user
router.delete('/users/:userId', deleteUserHandler);

export default router;
