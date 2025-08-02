import express, { Router } from 'express';
import passport from 'passport';
import { signup, login, logout, googleCallback } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login?error=google_auth_failed'
  }),
  googleCallback
);

// Protected routes
router.use(protect);
router.post('/logout', logout);
export default router;