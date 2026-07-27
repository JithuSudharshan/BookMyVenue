import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sessionId: {
      type: String, // String from crypto.randomUUID
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a user reference'],
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: [true, 'Please add a venue reference'],
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a vendor reference'],
    },

    bookingMode: {
      type: String,
      enum: ['hourly', 'daily'],
      required: true,
    },

    // Hourly
    date: { type: String }, // YYYY-MM-DD
    fromTime: { type: String }, // HH:MM
    toTime: { type: String }, // HH:MM
    durationMinutes: { type: Number },

    // Daily
    startDate: { type: String }, // YYYY-MM-DD
    endDate: { type: String }, // YYYY-MM-DD
    nights: { type: Number },

    guestCount: {
      type: Number,
      required: [true, 'Please provide the guest count'],
      min: [1, 'At least 1 guest is required'],
    },

    pricing: {
      baseAmount: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
      advanceAmount: { type: Number, required: true },
      remainingAmount: { type: Number, required: true, default: 0 },
      paymentPolicy: { type: String, enum: ['full_payment', 'advance_payment'], required: true, default: 'full_payment' },
      balanceDueDate: { type: Date, default: null },
      policyMetadata: { type: Object, default: {} },
    },

    payment: {
      method: { type: String, enum: ['wallet', 'razorpay', 'hybrid'], required: true },
      walletAmount: { type: Number, default: 0 },
      razorpayAmount: { type: Number, default: 0 },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      paidAt: { type: Date },
    },

    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refund_pending', 'refunded'],
      default: 'confirmed', // Created only after payment, so defaults to confirmed
    },
    
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'completed', 'refunded'],
      default: 'completed', 
    },

    cancellation: {
      cancelledAt: { type: Date },
      cancelledBy: { type: String, enum: ['user', 'vendor', 'admin'] },
      reason: { type: String },
      refundAmount: { type: Number },
      refundStatus: { type: String, enum: ['pending', 'processed', 'not_applicable'] },
    },

    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      }
    ],

    invoiceUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ vendorId: 1, bookingStatus: 1 });
bookingSchema.index({ userId: 1, bookingStatus: 1 });
bookingSchema.index({ venueId: 1, date: 1 });
bookingSchema.index({ venueId: 1, startDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
