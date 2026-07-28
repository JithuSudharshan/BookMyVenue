import express from 'express';
import PaymentService from '../services/core/PaymentService.js';
import * as ReservationService from '../services/core/ReservationService.js';

export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error('[CRITICAL] Webhook secret not configured.');
      return res.status(500).send('Webhook configuration error');
    }

    // Verify Signature
    const isValid = PaymentService.verifyWebhookSignature(req.rawBody, signature, secret);
    if (!isValid) {
      console.warn('Invalid webhook signature detected.');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      
      // Extract sessionId from notes
      const sessionId = paymentEntity.notes?.sessionId || event.payload.order?.entity?.notes?.sessionId;

      if (!sessionId) {
        console.warn('Webhook received but no sessionId found in notes. Cannot process booking.');
        return res.status(200).send('Ignored - No sessionId');
      }

      const paymentDetails = {
        method: 'razorpay',
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: 'WEBHOOK_VERIFIED'
      };

      // Delegate to idempotent ReservationService
      // If the frontend already verified this, it will safely return without duplicating the Booking
      await ReservationService.confirmReservation(sessionId, paymentDetails);
    }

    // Always return 200 OK to Razorpay so it doesn't retry infinitely
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    // Return 200 even on logical errors (unless DB is down) to prevent endless retries
    // Actually, returning 500 triggers retry. If it's a permanent logical error (like session not found), 
    // it's better to return 200.
    res.status(200).send('Error processed');
  }
};
