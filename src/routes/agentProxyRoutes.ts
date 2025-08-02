import express, {Request, Response , NextFunction } from 'express';

import { askAgent, getTrainingStatus, trainAgent } from '../services/agentApiService';
import multer from 'multer';
import { HttpStatus } from '../utils/httpStatus';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Proxy train request
router.post('/train', protect, upload.array('files'), catchAsync(async (req: Request, res: Response, next:NextFunction) => {
  let payload = {
    agentId: req.body.agentId,
    source: req.body.source,
    text: req.body.text,
    sourceUrl: req.body.sourceUrl,
    fileType: req.body.fileType,
    sourceMetadata: req.body.sourceMetadata ? JSON.parse(req.body.sourceMetadata) : undefined,
    files: (req.files as Express.Multer.File[] || []).map(file => ({
      path: file.path,
      originalname: file.originalname,
      mimetype: file.mimetype
    }))
  };

  if (!payload.agentId) {
    next(new AppError('Agent ID is required', HttpStatus.BAD_REQUEST))
  }

  const response = await trainAgent(payload);
  const responseData = response?.data as any;

  res.status(HttpStatus.OK).json({
    status: 'success',
    data: {
      jobId: responseData?.jobId,
      status: responseData?.status,
      message: responseData?.message || 'Training started. Poll /api/train/status/:jobId for progress.'
    }
  });
}));

// Proxy training status request
router.get('/train/status/:jobId', protect, catchAsync(async (req: Request, res: Response, next:NextFunction) => {
  if (!req.params.jobId) {
    next(  new AppError('Job ID is required', HttpStatus.BAD_REQUEST));
  }

  const response = await getTrainingStatus(req.params.jobId);
  
  res.status(HttpStatus.OK).json({
    status: 'success',
    data: response.data
  });
}));

// Proxy ask request
router.post('/ask', protect, catchAsync(async (req: Request, res: Response,next:NextFunction) => {
  if (!req.body.question) {
    next (new AppError('Question is required', HttpStatus.BAD_REQUEST));
  }

  const response = await askAgent(req.body);

  res.status(HttpStatus.OK).json({
    status: 'success',
    data: response.data
  });
}));

export default router; 