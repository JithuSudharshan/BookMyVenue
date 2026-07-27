import express from 'express';
import { getAdminWallet } from '../../controllers/admin/adminWalletController.js';

const router = express.Router();

// GET /api/admin/wallet
router.get('/', getAdminWallet);

export default router;
