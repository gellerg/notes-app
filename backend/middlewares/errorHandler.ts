import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error & { status?: number },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status ?? 500;
  const message = err.message || 'Internal server error';

  console.error(err);
  res.status(status).json({ message });
};
