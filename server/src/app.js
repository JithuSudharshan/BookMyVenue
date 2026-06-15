import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './config/passport.js'; // Initialize passport strategies
import authRoutes from './routes/authRoutes.js';

import vendorRoutes from './routes/vendorRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // Must match your frontend URL perfectly
  credentials: true,               // Allows the frontend to send and receive cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
