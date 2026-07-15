import { Request, Response } from 'express';
import { UserService } from '../services/userService';

/**
 * Controller handlers for User operations (/api/users)
 */

export const userRegisterHandler = async (req: Request, res: Response) => {
    try {
        const userData = req.body;

        // Validate required fields
        if (!userData.email || !userData.name || !userData.password) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['email', 'name', 'password'],
            });
        }

        const result = await UserService.register(userData);
        return res.status(201).json(result);
    } catch (error: any) {
        console.error('Error registering user:', error);
        if (error.message === 'Email already registered') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to register user', details: error.message });
    }
};

export const userLoginHandler = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required',
            });
        }

        const result = await UserService.login(email, password);
        return res.json(result);
    } catch (error: any) {
        console.error('Error during login:', error);
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Login failed', details: error.message });
    }
};

export const getUserProfileHandler = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const safeUser = await UserService.getUserById(userId);
        return res.json(safeUser);
    } catch (error: any) {
        console.error('Error fetching user:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    }
};

export const updateUserProfileHandler = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const safeUser = await UserService.updateUser(userId, updates);
        return res.json({
            message: 'User updated successfully',
            user: safeUser,
        });
    } catch (error: any) {
        console.error('Error updating user:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
};

export const getUsersListHandler = async (req: Request, res: Response) => {
    try {
        const role = req.query.role as string | undefined;
        const safeUsers = await UserService.getAllUsers(role);
        return res.json({
            count: safeUsers.length,
            users: safeUsers,
        });
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
};

export const deleteUserHandler = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        await UserService.deleteUser(userId);
        return res.json({
            message: 'User deleted successfully',
            userId,
        });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
};
