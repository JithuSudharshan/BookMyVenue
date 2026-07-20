import express from 'express';
import { getWalletDetails } from '../controllers/walletController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Secure all wallet routes
router.use(protect);

// GET /api/wallet - get wallet balance and transactions
router.get('/', getWalletDetails);

export default router;
