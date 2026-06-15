import express from 'express';
import cors from 'cors';
import noteRouter from './routes/noteRoutes';
import authRouter from './routes/authRoutes';
import aiRouter from './routes/aiRoutes';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors({
  exposedHeaders: ['X-Total-Count'],
}));

app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.send('OK');
});

app.use('/', authRouter);
app.use('/ai', aiRouter);
app.use('/notes', noteRouter);
app.use(errorHandler);

export default app;