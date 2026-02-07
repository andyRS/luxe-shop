import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  downloadInvoice,
  downloadCustomInvoice
} from '../controllers/orderController.js';
import {
  createPaymentIntent,
  confirmPayment,
  getStripeConfig,
  stripeWebhook
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas de Stripe
router.get('/stripe-config', getStripeConfig);
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm-payment', protect, confirmPayment);

// Rutas protegidas
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/invoice', protect, downloadInvoice);

// Rutas de admin
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.post('/:id/invoice/custom', protect, admin, downloadCustomInvoice);

export default router;
