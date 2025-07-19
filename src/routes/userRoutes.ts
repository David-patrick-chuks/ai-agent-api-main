import express from 'express';
import { getProfile } from '../controllers/userController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/me', authenticateJWT, getProfile);

export default router; 