import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel';
import { Document } from 'mongoose';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '7d';

type TokenPayload = {
  id: string;
  username: string;
  email: string;
  name: string;
};

type UserDoc = Document & {
  _id: any;
  name: string;
  email: string;
  username: string;
  passwordHash: string;
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (
  password: string,
  passwordHash: string
) => {
  return bcrypt.compare(password, passwordHash);
};

export const createToken = (user: UserDoc) => {
  const payload: TokenPayload = {
    id: user._id.toString(),
    username: (user as any).username,
    email: (user as any).email,
    name: (user as any).name,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
