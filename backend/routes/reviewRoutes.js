import express from 'express';
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  canReview,
  getMyReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/product/:productId', getProductReviews);

// Rutas protegidas
router.post('/', protect, createReview);
router.get('/my-reviews', protect, getMyReviews);
router.get('/can-review/:productId', protect, canReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, markReviewHelpful);

export default router;
