import { Request, Response } from 'express';
import { runAgent } from '../services/aiService';

export const completeAi = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    const result = await runAgent({ prompt });
    return res.status(200).json(result);
  } catch (error) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    return res.status(status).json({ message: err.message });
  }
};
