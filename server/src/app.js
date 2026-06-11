import express from 'express';
import cors from 'cors';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);

export default app;
