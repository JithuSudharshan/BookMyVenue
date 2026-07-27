import express from 'express';
import * as webhookController from '../controllers/webhookController.js';

const router = express.Router();

router.post('/razorpay', webhookController.handleRazorpayWebhook);

export default router;
