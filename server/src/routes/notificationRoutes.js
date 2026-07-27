import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { adminProtect } from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Hybrid middleware: if Authorization header exists, it's an admin, else it's a regular user using cookies
const hybridAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return adminProtect(req, res, next);
  }
  return protect(req, res, next);
};

// All notification routes must be authenticated
router.use(hybridAuth);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
