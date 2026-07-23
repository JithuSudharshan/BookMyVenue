import dotenv from 'dotenv';
dotenv.config();

import redisClient, { connectRedis } from './src/config/redis.js';
import jwt from 'jsonwebtoken';

const check = async () => {
  await connectRedis();
  
  const keys = await redisClient.keys('verify:*');
  console.log('Verification keys in Redis:', keys);
  
  for (const key of keys) {
    const val = await redisClient.get(key);
    console.log(`Key: ${key.substring(0, 30)}... => Value: ${val}`);
    
    const token = key.replace('verify:', '');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      console.log('Decoded Token:', decoded);
      console.log('Match?', decoded.id === val);
    } catch (e) {
      console.log('JWT Verification Error:', e.message);
    }
  }
  
  process.exit(0);
};

check();
