import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import catchAsync from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import  HttpStatus  from '../utils/httpStatus';


// Define interface for JWT payload
interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1) Getting token from header or cookies
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', HttpStatus.UNAUTHORIZED)
    );
  }

    // 2) Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    const decoded = await new Promise<JwtPayload>((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded as JwtPayload);
      });
    });

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('User belonging to this token does not exist', HttpStatus.NOT_FOUND)
      );
    }

    // 4) Grant access to protected route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  
}); 