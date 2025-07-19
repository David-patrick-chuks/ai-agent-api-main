import { Request, Response } from 'express';
 
export function getProfile(req: Request, res: Response) {
  const user = req.user as any;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ id: user._id, email: user.email, name: user.name, avatar: user.avatar });
} 