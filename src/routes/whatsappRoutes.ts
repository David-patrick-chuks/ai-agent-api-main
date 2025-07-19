import express from 'express';
import { deployWhatsapp, disconnectWhatsapp, restartWhatsapp, whatsappStatus, whatsappWebhook } from '../controllers/whatsappController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/deploy', authenticateJWT, deployWhatsapp);
router.post('/restart', authenticateJWT, restartWhatsapp);
router.post('/disconnect', authenticateJWT, disconnectWhatsapp);
router.get('/status', authenticateJWT, whatsappStatus);
router.post('/webhook', whatsappWebhook);

export default router; 