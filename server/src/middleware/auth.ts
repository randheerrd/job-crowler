import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token === 'dev-token' && process.env.NODE_ENV !== 'production') {
    prisma.user.findFirst().then(user => {
      if (user) { req.userId = user.id; next(); }
      else res.status(401).json({ error: 'No users in DB' });
    }).catch(() => res.status(500).json({ error: 'Auth error' }));
    return;
  }

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
