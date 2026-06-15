import { Request, Response } from 'express';
import { User } from '../models/userModel';
import * as authService from '../services/authService';

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, username, password } = req.body;

  if (!name || !email || !username || !password) {
    return res
      .status(400)
      .json({ message: 'Name, email, username and password are required' });
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ message: 'Username or email already exists' });
  }

  const passwordHash = await authService.hashPassword(password);

  const newUser = await User.create({
    name,
    email,
    username,
    passwordHash,
  });

  return res.status(201).json({
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    username: newUser.username,
  });
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const passwordMatches = await authService.comparePasswords(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = authService.createToken(user);

  return res.status(200).json({
    token,
    user: {
      name: user.name,
      email: user.email,
      username: user.username,
    },
  });
};
