import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { completeAi } from '../controllers/aiController';

const router = express.Router();

router.post('/complete', authMiddleware, completeAi);

export default router;
