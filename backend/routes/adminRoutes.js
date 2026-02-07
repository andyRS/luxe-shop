import express from 'express';
import { getDashboardStats, getUsers, updateUserRole, toggleUserActive, deleteUser } from '../controllers/adminController.js';
import { getAdminSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.put('/users/:id/toggle-active', protect, admin, toggleUserActive);
router.delete('/users/:id', protect, admin, deleteUser);

// Settings
router.get('/settings', protect, admin, getAdminSettings);
router.put('/settings', protect, admin, updateSettings);

export default router;
