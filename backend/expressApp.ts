import express from 'express';
import cors from 'cors';
import noteRouter from './routes/noteRoutes';
import { requestLogger } from './middlewares/requestLogger';

const app = express();

app.use(cors({
  exposedHeaders: ['X-Total-Count'],
}));

app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.send('OK');
});

app.use('/notes', noteRouter);

export default app;