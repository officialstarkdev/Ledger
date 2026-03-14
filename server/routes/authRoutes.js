import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, refreshToken, getMe } from '../controllers/authController.js';
import { registerValidation, loginValidation } from '../middleware/validate.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);

export default router;
