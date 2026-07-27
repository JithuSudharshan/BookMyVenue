import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';
import http from 'http';
import { initializeSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;


// Connect to Database
connectDB();

// Connect to Redis
connectRedis();

const server = http.createServer(app);
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Timezone sanity check for production readiness
  const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (systemTz !== 'Asia/Kolkata') {
    console.warn(`\n[WARNING] Server Timezone is ${systemTz}, but BookMyVenue expects Asia/Kolkata.`);
    console.warn(`This is fine for dev, but for production, ensure the server OS is set to IST (Asia/Kolkata) to avoid unexpected date boundary issues.\n`);
  }
});


