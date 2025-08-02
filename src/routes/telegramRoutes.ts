import { Router } from 'express';
import {
    deployTelegram,
    disconnectTelegram,
    restartTelegram,
    telegramStatus,
    telegramWebhook
} from '../controllers/telegramController';
import { protect } from '../middleware/authMiddleware';

const router = Router({ mergeParams: true });

router.use(protect)
router.post('/deploy',  deployTelegram);
router.post('/restart',  restartTelegram);
router.post('/disconnect',  disconnectTelegram);
router.get('/status',  telegramStatus);
router.post('/webhook', telegramWebhook);


export default router; 