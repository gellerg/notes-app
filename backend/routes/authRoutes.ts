import express from 'express';
import { loginUser, registerUser } from '../controllers/authController';

const router = express.Router();

router.post('/users', registerUser);
router.post('/login', loginUser);

export default router;
