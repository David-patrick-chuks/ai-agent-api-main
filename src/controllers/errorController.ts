import { Request, Response, NextFunction } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import  HttpStatus  from '../utils/httpStatus';

interface IError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: number;
  path?: string;
  value?: string;
  errors?: { [key: string]: { message: string } };
  errmsg?: string;
}

/**
 * Handles Mongoose CastError (invalid ID format)
 */
const handleCastErrorDB = (err: MongooseError.CastError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, HttpStatus.BAD_REQUEST);
};

/**
 * Handles MongoDB duplicate field errors
 */
const handleDuplicateFieldsDB = (err: MongoError): AppError => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || '';
  const message = `Duplicate field value: ${value}. Please provide another value!`;
  return new AppError(message, HttpStatus.BAD_REQUEST);
};

/**
 * Handles Mongoose validation errors
 */
const handleValidationErrorDB = (err: MongooseError.ValidationError): AppError => {
  console.log("validation-reached")
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, HttpStatus.BAD_REQUEST);
};

/**
 * Handles JWT invalid signature errors
 */
const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again!', HttpStatus.UNAUTHORIZED);

/**
 * Handles JWT expiration errors
 */
const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired! Please log in again.', HttpStatus.UNAUTHORIZED);

/**
 * Sends detailed error response in development environment
 */
const sendErrorDev = (err: IError, req: Request, res: Response): void => {
  if (req.originalUrl.startsWith('/api')) {
    console.log(err, "logger...")
    // console.log(err.stack, err.statusCode, err.code, "logger...")
    if (err instanceof AppError) {
      // Use serializedError() for AppError instances
      res.status(err.statusCode).json(err.serializedError());
    } else {
      // Fallback for other types of errors
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        error: err,
        message: err.message,
        stack: err.stack
      });
    }
    return;
  }

  console.error('ERROR 💥', err);
  if (err instanceof AppError) {
    res.status(err.statusCode).json(err.serializedError());
  } else {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

/**
 * Sends sanitized error response in production environment
 */
const sendErrorProd = (err: IError, req: Request, res: Response): void => {
  // A) API Errors
  if (req.originalUrl.startsWith('/api')) {
    if (err instanceof AppError) {
      // Use serializedError for operational errors
      res.status(err.statusCode).json(err.serializedError());
      return;
    }
    
    // Programming or unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Something went wrong!'
    });
    return;
  }

  // B) Non-API Errors
  if (err instanceof AppError) {
    const serialized = err.serializedError();
    res.status(err.statusCode).json({
      title: 'Error',
      ...serialized
    });
    return;
  }

  // Programming or unknown error: don't leak error details
  console.error('ERROR 💥', err);
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'Please try again later.'
  });
};

/**
 * Global error handling middleware
 */
export const globalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Convert error to AppError if it isn't already
  let error: AppError | IError = err 
  console.log(error.name, "error-name");
  // if (!(error instanceof AppError)) {
  //   error = new AppError(err.message || 'Something went wrong!', 
  //                       err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
  // }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {

    if (error.name === 'CastError') error = handleCastErrorDB(error as MongooseError.CastError);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error as MongoError);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error as MongooseError.ValidationError);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
