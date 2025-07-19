import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Token expiration times - Development-friendly settings
// In production, consider shorter times: ACCESS_TOKEN_EXPIRES='15m', REFRESH_TOKEN_EXPIRES='7d'
const ACCESS_TOKEN_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '24h'; // Configurable via env, default 24h for development
const REFRESH_TOKEN_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '30d'; // Configurable via env, default 30d for development

function generateTokens(user: any) {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  const accessExpires = process.env.JWT_ACCESS_EXPIRES || '24h';
  const refreshExpires = process.env.JWT_REFRESH_EXPIRES || '30d';
  
  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT secrets not configured');
  }
  
  const accessToken = jwt.sign(
    { id: user._id },
    accessSecret,
    { expiresIn: accessExpires as any }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    refreshSecret,
    { expiresIn: refreshExpires as any }
  );
  return { accessToken, refreshToken };
}

export async function signup(req: Request, res: Response) {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const avatar = `https://robohash.org/${encodeURIComponent(email)}.png`;
    const user = await User.create({ email, password: hashed, name, avatar });
    const tokens = generateTokens(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();
    res.status(201).json({ user: { id: user._id, email: user.email, name: user.name, avatar: user.avatar }, ...tokens });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const tokens = generateTokens(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();
    res.json({ user: { id: user._id, email: user.email, name: user.name }, ...tokens });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err });
  }
}

export async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });
  try {
    const payload: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || '');
    const user = await User.findById(payload.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) return res.status(403).json({ message: 'Invalid refresh token' });
    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken);
    const tokens = generateTokens(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();
    res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });
  try {
    const payload: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || '');
    const user = await User.findById(payload.id);
    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });
    user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken);
    await user.save();
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
}

export async function googleCallback(req: Request, res: Response) {
  try {
    // On success, issue tokens
    const user = req.user as any;
    const tokens = generateTokens(user);
    
    // Find and update the user to store refresh token
    const updatedUser = await User.findById(user._id);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    updatedUser.refreshTokens.push(tokens.refreshToken);
    await updatedUser.save();
    
    // Redirect back to the dashboard with the access token
    res.redirect(`/dashboard.html?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect('/login.html?error=auth_failed');
  }
} 