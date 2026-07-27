import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null, // Null for wallet top-ups
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a user reference'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide the amount'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentType: {
      type: String,
      enum: ['booking', 'wallet_topup'],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'wallet'],
      required: true,
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'wallet'],
      required: true,
    },
    gatewayOrderId: {
      type: String,
      default: null,
    },
    gatewayPaymentId: {
      type: String,
      default: null,
    },
    gatewaySignature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
