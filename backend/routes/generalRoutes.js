import express from 'express';
import { submitContact, getContacts, subscribeNewsletter, unsubscribeNewsletter } from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { contactValidation, newsletterValidation } from '../middleware/validation.js';

const router = express.Router();

// Contact
router.post('/contact', contactValidation, submitContact);
router.get('/contact', protect, admin, getContacts);

// Newsletter
router.post('/newsletter', newsletterValidation, subscribeNewsletter);
router.delete('/newsletter/:email', unsubscribeNewsletter);

export default router;
