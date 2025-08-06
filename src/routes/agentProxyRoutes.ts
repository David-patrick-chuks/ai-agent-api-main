import express, { NextFunction, Request, Response } from 'express';

import multer from 'multer';
import { askAgent, getTrainingStatus, trainAgent } from '../services/agentApiService';
import { AppError } from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Proxy train request
router.post('/train', upload.array('files'), catchAsync(async (req: Request, res: Response, next:NextFunction) => {
  let payload = {
    agentId: req.body.agentId,
    source: req.body.source,
    text: req.body.text,
    sourceUrl: req.body.sourceUrl,
    fileType: req.body.fileType,
    sourceMetadata: req.body.sourceMetadata ? JSON.parse(req.body.sourceMetadata) : undefined,
    files: (req.files as Express.Multer.File[] || []).map(file => {
      // Files are already in memory, just return them as expected by external API
      return {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      };
    })
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
router.get('/train/status/:jobId', catchAsync(async (req: Request, res: Response, next:NextFunction) => {
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
router.post('/ask', catchAsync(async (req: Request, res: Response,next:NextFunction) => {
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