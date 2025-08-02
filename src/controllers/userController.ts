import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import  HttpStatus  from '../utils/httpStatus';

export const getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return next(new AppError('You are not logged in! Please log in to get access.', HttpStatus.UNAUTHORIZED));
  }

  res.status(HttpStatus.OK).json({
    status: 'success',
    data: {user}
  });
}); 