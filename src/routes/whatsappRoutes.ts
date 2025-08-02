import express from 'express';
import { deployWhatsapp, disconnectWhatsapp, restartWhatsapp, whatsappStatus, whatsappWebhook } from '../controllers/whatsappController';
import { protect } from '../middleware/authMiddleware';
const router = express.Router();
router.use(protect)
router.post('/deploy', deployWhatsapp);
router.post('/restart',restartWhatsapp);
router.post('/disconnect',disconnectWhatsapp);
router.get('/status', whatsappStatus);
router.post('/webhook', whatsappWebhook);

export default router; 