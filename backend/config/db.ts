import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectToDatabase = async () => {
  const mongoUrl = process.env.MONGODB_CONNECTION_URL;

  if (!mongoUrl) {
    throw new Error('MONGODB_CONNECTION_URL is missing from .env file');
  }

  await mongoose.connect(mongoUrl);
  console.log('Connected to MongoDB');
};