import express from 'express';
import {
  validateCoupon,
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  getActiveCoupons
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/active', getActiveCoupons);

// Rutas protegidas
router.post('/validate', protect, validateCoupon);

// Rutas de admin
router.post('/', protect, admin, createCoupon);
router.get('/', protect, admin, getAllCoupons);
router.get('/:id', protect, admin, getCouponById);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

export default router;
