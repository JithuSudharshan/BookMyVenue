import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './config/passport.js';

// ── Route imports ──────────────────────────────────────
import authRoutes   from './routes/authRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import userRoutes   from './routes/user/index.js';    // /home, /venues
import adminRoutes  from './routes/admin/index.js';   // /categories, /subcategories
import vendorRoutes from './routes/vendor/index.js';  // /venues (new structured)

// Legacy feature routes — kept until migrated to subdomain structure
import customerRoutes from './routes/user/customerRoutes.js';
import legacyVendorRoutes from './routes/vendor/vendorRoutes.js';

const app = express();

// ── Middleware ─────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/wallet',   walletRoutes);
app.use('/api',          userRoutes);          // /api/home, /api/venues
app.use('/api/admin',    adminRoutes);
app.use('/api/vendor',   legacyVendorRoutes); // onboarding, profile
app.use('/api/vendor',   vendorRoutes);        // venue management
app.use('/api/customer', customerRoutes);

// ── Health check ────────────────────────────────────────
app.get('/', (req, res) => res.send('API is running...'));

// ── 404 catch-all ───────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ────────────────────────────────
import { globalErrorHandler } from './middlewares/errorHandler.js';
app.use(globalErrorHandler);

export default app;
