import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization?.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authorization.substring(7);

  try {
    const decoded = authService.verifyToken(token);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
