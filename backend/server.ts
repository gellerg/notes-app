import app from './expressApp';
import { connectToDatabase } from './config/db';

const PORT = 3001;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });