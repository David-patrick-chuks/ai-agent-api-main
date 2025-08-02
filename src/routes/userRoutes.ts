import express from 'express';
import { getProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
router.use(protect)
router.get('/me', getProfile);

export default router; 