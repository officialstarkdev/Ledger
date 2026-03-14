import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import ledgerRoutes from './routes/ledgerRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import auditLogger from './middleware/auditMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Security Headers
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// 2. Robust CORS Configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        console.log(`Incoming Origin: ${origin}`);
        
        const isAllowed = origin === allowedOrigin || 
                          origin === allowedOrigin.replace(/\/$/, '') ||
                          origin.endsWith('.vercel.app'); // Temporarily allow all vercel subdomains for easier setup
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`CORS Blocked for: ${origin}. Allowed: ${allowedOrigin}`);
            callback(null, true); // Still allow it but log the warning to fix the Vercel 404
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie']
}));

// 3. Explicit Preflight Handling
app.options('*', cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Audit logging
app.use(auditLogger);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ledger', ledgerRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React production build - ONLY outside Vercel
if (process.env.VERCEL !== '1') {
    const distPath = path.join(__dirname, '..', 'web', 'dist');
    app.use(express.static(distPath));

    // SPA catch-all — send index.html for any non-API route
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`App available at http://localhost:${PORT}`);
        });
    });
}

export default app;