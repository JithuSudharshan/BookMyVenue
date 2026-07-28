import mongoose from 'mongoose';

const paymentRecordSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null, // Null if payment failed and no booking was created
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    method: {
      type: String,
      enum: ['wallet', 'razorpay', 'hybrid'],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    walletAmount: {
      type: Number,
      default: 0,
    },
    razorpayAmount: {
      type: Number,
      default: 0,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded'],
      required: true,
    },
    failureReason: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const PaymentRecord = mongoose.model('PaymentRecord', paymentRecordSchema);

export default PaymentRecord;
