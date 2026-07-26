import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';

// Protect routes
export const protect = async (req, res, next) => {
  if (req.method === 'OPTIONS') return next(); // Allow CORS preflight through
  let token;

  // Read token from the 'accessToken' cookie
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      // Verify token
      const secret = process.env.JWT_SECRET || 'secret123';
      const decoded = jwt.verify(token, secret);

      // Get user from the token
      req.user = await userRepository.findUserById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check if user is blocked
      if (req.user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been blocked.' });
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired, please log in again' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') return next(); // Allow CORS preflight through
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
