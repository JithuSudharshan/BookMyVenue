import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './config/passport.js';

// ── Route imports ──────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import userRoutes from './routes/user/index.js';    // /home, /venues
import adminRoutes from './routes/admin/index.js';   // /categories, /subcategories
import vendorRoutes from './routes/vendor/index.js';  // /venues (new structured)
import webhookRoutes from './routes/webhookRoutes.js';

// Legacy feature routes — kept until migrated to subdomain structure
import customerRoutes from './routes/user/customerRoutes.js';
import legacyVendorRoutes from './routes/vendor/vendorRoutes.js';

const app = express();

// ── Middleware ─────────────────────────────────────────
app.use(cors({
    origin: (origin, callback) => {
        // Evaluate at runtime to avoid ES module import hoisting issues with dotenv
        const allowedOrigins = [
            process.env.CLIENT_URL,
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174'
        ];
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            console.log('Allowed origins:', allowedOrigins);
            callback(null, false); // Do not throw an error, just block
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 0  // Don't cache preflight responses in dev
}));
// Explicitly handle all OPTIONS requests
app.options('*', cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Global API Response Formatter
import { responseFormatter } from './middlewares/responseFormatter.js';
app.use(responseFormatter);

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api', userRoutes);          // /api/home, /api/venues
app.use('/api/admin', adminRoutes);
app.use('/api/vendor', legacyVendorRoutes); // onboarding, profile
app.use('/api/vendor', vendorRoutes);        // venue management
app.use('/api/customer', customerRoutes);
app.use('/api/webhooks', webhookRoutes);

// ── Health check ────────────────────────────────────────
app.get('/', (req, res) => res.send('API is running...'));

// ── 404 catch-all ───────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ────────────────────────────────
import { globalErrorHandler } from './middlewares/errorHandler.js';
app.use(globalErrorHandler);

export default app;
