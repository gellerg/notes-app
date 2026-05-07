import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    method: req.method,
    route: req.originalUrl,
    body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
  };

  const logPath = path.join(__dirname, '..', 'log.txt');

  fs.appendFileSync(logPath, `${JSON.stringify(logEntry)}\n`);

  next();
};