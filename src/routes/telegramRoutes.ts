import { Router } from 'express';
import {
    deployTelegram,
    disconnectTelegram,
    restartTelegram,
    telegramStatus,
    telegramWebhook
} from '../controllers/telegramController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router({ mergeParams: true });

router.post('/deploy', authenticateJWT, deployTelegram);
router.post('/restart', authenticateJWT, restartTelegram);
router.post('/disconnect', authenticateJWT, disconnectTelegram);
router.get('/status', authenticateJWT, telegramStatus);
router.post('/webhook', telegramWebhook);

//  this 
export default router; 