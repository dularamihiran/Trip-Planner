import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';

/**
 * Controller to handle all /api/admin requests
 */
export const getAllUsersHandler = async (req: Request, res: Response) => {
    try {
        const data = await AdminService.getAllUsers();
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getStatsHandler = async (req: Request, res: Response) => {
    try {
        const data = await AdminService.getStats();
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const adminLoginHandler = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const result = await AdminService.login(email, password);

        if (!result) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteUserHandler = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const isDeleted = await AdminService.deleteUser(userId);

        if (!isDeleted) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
