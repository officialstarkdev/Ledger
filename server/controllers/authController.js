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

    console.log(`Setting Cookies - Secure: ${cookieOptions.secure}, SameSite: ${cookieOptions.sameSite}`);

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
        console.log(`Login Attempt - Email: ${email}, Host: ${req.headers.host}`);

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.warn(`Login Failed - User not found: ${email}`);
            res.status(401);
            throw new Error('Invalid email or password');
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.warn(`Login Failed - Password mismatch: ${email}`);
            res.status(401);
            throw new Error('Invalid email or password');
        }

        console.log(`Login Success - User Found: ${user.email}`);
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
        console.error(`Login Error: ${error.message}`);
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
        console.log(`Refresh Attempt - Token Present: ${!!token}`);

        if (!token) {
            console.warn('Refresh Attempt Failed: No Token');
            res.status(401);
            throw new Error('No refresh token');
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        console.log(`Refresh - Token Verified for ID: ${decoded.id}`);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            console.error(`Refresh - User not found for ID: ${decoded.id}`);
            res.status(401);
            throw new Error('User not found');
        }

        console.log(`Refresh Success - User: ${user.email}`);
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
