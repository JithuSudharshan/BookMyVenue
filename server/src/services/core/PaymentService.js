import crypto from 'crypto';
import { getRazorpayInstance } from '../../config/razorpay.js';
import AppError from '../../utils/AppError.js';
import BookingSession from '../../models/bookingSessionModel.js';

class PaymentService {
  /**
   * Creates or reuses a Razorpay order for an active BookingSession
   */
  async createRazorpayOrder(session) {
    if (session.status !== 'active') {
      throw new AppError('Cannot create payment order for an inactive session', 400);
    }

    // Reuse existing order if present
    if (session.razorpayOrderId) {
      return {
        id: session.razorpayOrderId,
        amount: Math.round(session.pricing.razorpayAmount * 100), // Note: razorpayAmount should be pre-calculated in session
        currency: 'INR'
      };
    }

    // Amount to be paid via Razorpay (either advance or total, minus wallet deduction)
    let payableAmount = 0;
    if (session.pricing.paymentPolicy === 'advance_payment') {
      payableAmount = session.pricing.advanceAmount;
    } else {
      payableAmount = session.pricing.totalAmount;
    }
    
    payableAmount -= (session.pricing.walletDeduction || 0);

    // If payable amount is <= 0 (e.g., 100% wallet payment), this shouldn't go to Razorpay.
    // The controller should bypass order creation in that case.
    if (payableAmount <= 0) {
      throw new AppError('Amount payable via gateway is 0. Please proceed via wallet completion.', 400);
    }

    const amountInPaise = Math.round(payableAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${session.sessionId.substring(0, 8)}`,
      notes: {
        sessionId: session.sessionId,
        venueId: session.venueId.toString(),
        userId: session.userId.toString()
      }
    };

    const instance = getRazorpayInstance();
    try {
      const order = await instance.orders.create(options);
      
      // Persist order details in the session
      session.razorpayOrderId = order.id;
      session.pricing.razorpayAmount = payableAmount;
      await session.save();

      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      };
    } catch (error) {
      console.error('Razorpay Order Creation Error:', error);
      throw new AppError('Failed to initialize payment gateway', 500);
    }
  }

  /**
   * Verifies the HMAC SHA256 signature returned by Razorpay Checkout
   */
  verifyRazorpaySignature(orderId, paymentId, signature) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new AppError('Payment configuration error', 500);

    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Verifies the webhook signature sent by Razorpay servers
   */
  verifyWebhookSignature(rawBody, signature, secret) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === signature;
  }
}

export default new PaymentService();
