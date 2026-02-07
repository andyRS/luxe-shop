import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  googleCallback,
  forgotPassword,
  resetPassword,
  verifyEmail
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } from '../middleware/validation.js';

const router = express.Router();

// Rutas públicas
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Rutas de Google OAuth
router.get('/google', (req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${frontendUrl}/login?error=google_not_configured`);
  }
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${frontendUrl}/login?error=google_not_configured`);
  }
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${frontendUrl}/login?error=google_auth_failed` 
  })(req, res, next);
}, googleCallback);

// Rutas protegidas
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
