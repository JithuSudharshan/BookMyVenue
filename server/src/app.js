import express from 'express';
import cors from 'cors';

import userRoutes from "./routes/user/index.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use("/api", userRoutes);

export default app;
