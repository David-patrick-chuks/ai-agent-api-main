import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { askAgent, getTrainingStatus, trainAgent } from '../services/agentApiService';
// @ts-ignore
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Proxy train request
router.post('/train', authenticateJWT, upload.array('files'), async (req, res) => {
  try {
    let payload = {};
    if (req.is('multipart/form-data')) {
      // Handle file uploads and fields
      // @ts-ignore
      const files = req.files || [];
      payload = {
        agentId: req.body.agentId,
        source: req.body.source,
        text: req.body.text,
        sourceUrl: req.body.sourceUrl,
        fileType: req.body.fileType,
        sourceMetadata: req.body.sourceMetadata ? JSON.parse(req.body.sourceMetadata) : undefined,
        files: Array.isArray(files) ? files : [files]
      };
    } else {
      // Handle JSON
      payload = req.body;
    }
    const response = await trainAgent(payload);
    const data = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : {};
    res.status(200).json({
      jobId: data.jobId,
      status: data.status,
      message: data.message || 'Training started. Poll /api/train/status/:jobId for progress.'
    });
  } catch (error) {
    let errData = error;
    let status = 500;
    let message = 'Agent train error';
    if (error && typeof error === 'object') {
      if ('response' in error && error.response && typeof error.response === 'object') {
        // @ts-ignore
        if ('data' in error.response) {
          // @ts-ignore
          errData = error.response.data;
        }
        // @ts-ignore
        if ('status' in error.response) {
          // @ts-ignore
          status = error.response.status;
        }
      }
      if ('message' in error) {
        // @ts-ignore
        message = error.message;
      }
    }
    res.status(status).json({
      error: errData || message
    });
  }
});

// Proxy training status request
router.get('/train/status/:jobId', authenticateJWT, async (req, res) => {
  try {
    const response = await getTrainingStatus(req.params.jobId);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message || 'Agent status error'
    });
  }
});

// Proxy ask request
router.post('/ask', authenticateJWT, async (req, res) => {
  try {
    const response = await askAgent(req.body);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message || 'Agent ask error'
    });
  }
});

export default router; 