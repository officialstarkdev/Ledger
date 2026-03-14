import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const setCookies = (res, accessToken, refreshToken) => {
    const cookieOptions = {
        httpOnly: true,
        secure: true, // Always true for cross-domain/Vercel
        sameSite: 'none', // Required for cross-domain cookies
    };

    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

// POST /api/auth/register
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400);
            throw new Error('User already exists with this email');
        }

        const user = await User.create({ name, email, password });

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        setCookies(res, accessToken, refreshToken);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            createdAt: user.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            res.status(401);
            throw new Error('Invalid email or password');
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        setCookies(res, accessToken, refreshToken);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            createdAt: user.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/logout
export const logout = (req, res) => {
    res.cookie('accessToken', '', { httpOnly: true, secure: true, sameSite: 'none', expires: new Date(0) });
    res.cookie('refreshToken', '', { httpOnly: true, secure: true, sameSite: 'none', expires: new Date(0) });
    res.json({ message: 'Logged out successfully' });
};

// POST /api/auth/refresh
export const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            res.status(401);
            throw new Error('No refresh token');
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            res.status(401);
            throw new Error('User not found');
        }

        const accessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);
        setCookies(res, accessToken, newRefreshToken);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
        });
    } catch (error) {
        res.cookie('accessToken', '', { httpOnly: true, secure: true, sameSite: 'none', expires: new Date(0) });
        res.cookie('refreshToken', '', { httpOnly: true, secure: true, sameSite: 'none', expires: new Date(0) });
        res.status(401);
        next(new Error('Invalid refresh token'));
    }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
    res.json(req.user);
};
