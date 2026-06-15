import express from 'express';
import cors from 'cors';

import userRoutes from "./routes/user/index.js";
import adminRoutes from "./routes/admin/index.js"

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
app.use("/api/admin", adminRoutes)

export default app;
