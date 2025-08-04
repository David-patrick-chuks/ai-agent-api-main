import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';
import { User } from '../models/User';
import { AppError } from "../utils/appError";
import catchAsync from '../utils/catchAsync';
import HttpStatus from "../utils/httpStatus";

/**
 * Signs a JWT token with the user ID
 * @param {string} id - The user ID to sign
 * @returns {string} The signed JWT token
 */
const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  if (!secret) {
    throw new Error('JWT secret not configured');
  }
  const options: jwt.SignOptions = {
    expiresIn: expiresIn as StringValue
  };
  return jwt.sign(
    { id },
    secret,
     options
  );
};

/**
 * Creates and sends a JWT token in a cookie
 * @param {Document} user - The user document
 * @param {number} statusCode - The HTTP status code to send
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const createSendToken = (
  user: any,
  statusCode: number,
  req: Request,
  res: Response
): void => {
  const token = signToken(user._id);
  const cookieExpiresIn = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7;

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? req.secure || req.headers['x-forwarded-proto'] === 'https' : false,
    sameSite: "lax" as const,
   
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove sensitive data from response
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}

export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;
  
  if (!email || !password){ 
 next(new AppError("Please provide a valid email address and password", HttpStatus.BAD_REQUEST))
  }

  const existing = await User.findOne({ email });
  if (existing){ 
   return  next(new AppError("The mail provide may be in use please provid a valid mail",HttpStatus.CONFLICT ))
  }

  const hashed = await bcrypt.hash(password, 10);
  const avatar = `https://robohash.org/${encodeURIComponent(email)}.png`;
  
  const user = await User.create({
    email,
    password: hashed,
    name,
    avatar
  });

  createSendToken(user, HttpStatus.CREATED, req, res);
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password){
    return (new AppError("Please provide email and password", HttpStatus.BAD_REQUEST))
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Please provide a valid credentials", HttpStatus.UNAUTHORIZED))
  }

    createSendToken(user, HttpStatus.OK, req, res); 
});


export const logout = catchAsync(async (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(HttpStatus.OK).json({
    status: 'success',
    message: 'Successfully logged out'
  });
});

export const googleCallback = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  
  if (!user) {
    return res.redirect('/login.html?error=auth_failed');
  }
  const token = signToken(user._id);
  
  // Redirect to dashboard with token in query params
  // Frontend should handle storing the token in cookie
  res.redirect(`/dashboard.html?token=${token}&refreshToken=${token}`);
}); 

