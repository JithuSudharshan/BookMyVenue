import jwt from 'jsonwebtoken';
import { findAdminById } from '../repositories/admin/adminAuthRepository.js';

export const adminProtect = async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // Verify token using admin secret key
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) {
        return res.status(500).json({ message: 'Server configuration error: JWT_ACCESS_SECRET is missing.' });
      }
      
      const decoded = jwt.verify(token, secret);

      // Get admin from database
      req.user = await findAdminById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, admin user not found' });
      }

      // Check if admin is active
      if (req.user.status === 'inactive') {
        return res.status(403).json({ message: 'Your admin account has been suspended.' });
      }

      // Check role just in case (must be admin or super_admin)
      if (!['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized as an admin' });
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
