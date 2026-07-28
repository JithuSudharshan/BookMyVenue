import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

let io;

export const initializeSocket = (server) => {
  const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174'
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Setup Redis Adapter
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const pubClient = new Redis(redisUrl);
  const subClient = pubClient.duplicate();

  pubClient.on('error', (err) => console.error('Redis PubClient Error:', err));
  subClient.on('error', (err) => console.error('Redis SubClient Error:', err));

  io.adapter(createAdapter(pubClient, subClient));

  // Authentication Middleware
  io.use((socket, next) => {
    // Client should send token in handshake.auth.token or via cookies
    let token = socket.handshake.auth.token;

    if (!token && socket.request.headers.cookie) {
      const cookies = socket.request.headers.cookie.split(';');
      const accessTokenCookie = cookies.find(c => c.trim().startsWith('accessToken='));
      if (accessTokenCookie) {
        token = accessTokenCookie.split('=')[1];
      }
    }
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const secret = process.env.JWT_SECRET || 'secret123';
      const decoded = jwt.verify(token, secret);
      socket.userId = decoded.id; // Attach user ID to socket
      next();
    } catch (error) {
      try {
        const adminSecret = process.env.JWT_ACCESS_SECRET;
        if (!adminSecret) throw new Error('Missing admin secret');
        const decodedAdmin = jwt.verify(token, adminSecret);
        socket.userId = decodedAdmin.id;
        next();
      } catch (adminError) {
        next(new Error('Authentication error: Invalid token'));
      }
    }
  });

  // Connection Handler
  io.on('connection', (socket) => {
    // Join a room specifically for this user's ID to allow direct targeting
    // This makes it extremely easy to broadcast to all tabs a user has open
    socket.join(socket.userId);
  });

  console.log('Socket.IO initialized with Redis Adapter');
  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
