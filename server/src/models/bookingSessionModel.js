import mongoose from 'mongoose';
import crypto from 'crypto';

const bookingSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => crypto.randomUUID(),
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
    bookingMode: {
      type: String,
      enum: ['hourly', 'daily'],
      required: true,
    },
    // Hourly
    date: {
      type: String, // YYYY-MM-DD
    },
    fromTime: {
      type: String, // HH:MM
    },
    toTime: {
      type: String, // HH:MM
    },
    // Daily
    startDate: {
      type: String, // YYYY-MM-DD
    },
    endDate: {
      type: String, // YYYY-MM-DD
    },

    guestCount: {
      type: Number,
      required: true,
    },

    pricing: {
      baseAmount: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
      advanceAmount: { type: Number, required: true },
      remainingAmount: { type: Number, required: true, default: 0 },
      paymentPolicy: { type: String, enum: ['full_payment', 'advance_payment'], required: true, default: 'full_payment' },
      balanceDueDate: { type: Date, default: null },
      policyMetadata: { type: Object, default: {} },
      walletDeduction: { type: Number, default: 0 },
      razorpayAmount: { type: Number, default: 0 },
    },

    walletDeducted: {
      type: Boolean,
      default: false,
    },
    walletDeductedAmt: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'wallet_deducted', 'completed', 'failed', 'expired'],
      default: 'pending',
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },

    status: {
      type: String,
      enum: ['active', 'confirmed', 'released', 'expired'],
      default: 'active',
    },
    
    // TTL index - auto deletes after expiry if not converted to a booking
    // Note: In a production app, instead of auto-delete, you might just want an index on expiresAt
    // and let a cron job clean it up, or use a TTL index that removes the document.
    // If the document is deleted, we might lose trace of failed sessions. 
    // For now, let's stick to the plan and use a TTL index. 
    // We will set the TTL to 0 so it expires exactly at `expiresAt`.
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, 
    }
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent double bookings on the exact same slot while session is active
// This is crucial for race condition protection.
bookingSessionSchema.index(
  { venueId: 1, date: 1, fromTime: 1, toTime: 1, status: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: 'active', bookingMode: 'hourly' } 
  }
);

bookingSessionSchema.index(
  { venueId: 1, startDate: 1, endDate: 1, status: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: 'active', bookingMode: 'daily' } 
  }
);

const BookingSession = mongoose.model('BookingSession', bookingSessionSchema);

export default BookingSession;
