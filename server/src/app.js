import express from 'express';
import cors from 'cors';
import adminRoutes from "./routes/admin/index.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import your routes here
// app.use('/api/users', userRoutes);
app.use("/api/admin", adminRoutes)

export default app;
