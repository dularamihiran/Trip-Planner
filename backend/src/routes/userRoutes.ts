import express from 'express';
import {
  userRegisterHandler,
  userLoginHandler,
  getUserProfileHandler,
  updateUserProfileHandler,
  getUsersListHandler,
  deleteUserHandler,
} from '../controllers/userController';

const router = express.Router();

/**
 * Register a new user
 */
router.post('/register', userRegisterHandler);

/**
 * User login
 */
router.post('/login', userLoginHandler);

/**
 * Get user profile by ID
 */
router.get('/:userId', getUserProfileHandler);

/**
 * Update user profile
 */
router.put('/:userId', updateUserProfileHandler);

/**
 * Get all users (Admin only)
 */
router.get('/', getUsersListHandler);

/**
 * Delete a user (Admin only)
 */
router.delete('/:userId', deleteUserHandler);

export default router;
