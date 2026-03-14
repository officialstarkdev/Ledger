import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        
        console.log(`Auth Check - Path: ${req.path}, Token Present: ${!!token}`);

        if (!token) {
            console.warn(`Unauthorized Access Attempt: No Token for path ${req.path}`);
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            console.error(`User not found for token ID: ${decoded.id}`);
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        console.log(`Auth Success - User: ${req.user.email}`);
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Not authorized' });
    }
};

export default protect;
